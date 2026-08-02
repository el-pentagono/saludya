import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rol } from '../../common/enums/rol.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { BovedaSaludMentalService } from './boveda-salud-mental.service';
import { RegistroSaludMental } from './entities/registro-salud-mental.entity';

const paciente = { id: 'paciente-1', rol: Rol.PACIENTE } as Usuario;
const otroPaciente = { id: 'paciente-2', rol: Rol.PACIENTE } as Usuario;
const medico = { id: 'medico-1', rol: Rol.MEDICO } as Usuario;
const otroMedico = { id: 'medico-2', rol: Rol.MEDICO } as Usuario;
const director = { id: 'director-1', rol: Rol.DIRECTOR } as Usuario;
const auditor = { id: 'auditor-1', rol: Rol.AUDITOR } as Usuario;
const enfermero = { id: 'enfermero-1', rol: Rol.ENFERMERO } as Usuario;

const entradaCompleta = (): RegistroSaludMental =>
  ({
    id: 'entrada-1',
    pacienteId: paciente.id,
    medicoId: medico.id,
    notasPrivadas: 'Contenido clínico sensible',
    resumenPaciente: 'Fuiste evaluado, todo en orden',
  }) as RegistroSaludMental;

describe('BovedaSaludMentalService', () => {
  let service: BovedaSaludMentalService;
  let repo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock };
  let usuariosService: { findOne: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'entrada-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    usuariosService = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BovedaSaludMentalService,
        { provide: getRepositoryToken(RegistroSaludMental), useValue: repo },
        { provide: UsuariosService, useValue: usuariosService },
      ],
    }).compile();

    service = module.get(BovedaSaludMentalService);
  });

  describe('crear', () => {
    it('crea una entrada con notasPrivadas y resumenPaciente cuando el destinatario es un paciente', async () => {
      usuariosService.findOne.mockResolvedValue(paciente);

      const resultado = await service.crear(medico, {
        pacienteId: paciente.id,
        notasPrivadas: 'Contenido clínico sensible',
        resumenPaciente: 'Fuiste evaluado, todo en orden',
      });

      expect(resultado).toMatchObject({
        pacienteId: paciente.id,
        medicoId: medico.id,
        notasPrivadas: 'Contenido clínico sensible',
        resumenPaciente: 'Fuiste evaluado, todo en orden',
      });
    });

    it('rechaza si el destinatario no tiene rol paciente', async () => {
      usuariosService.findOne.mockResolvedValue(enfermero);

      await expect(
        service.crear(medico, {
          pacienteId: enfermero.id,
          notasPrivadas: 'x',
          resumenPaciente: 'y',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listar', () => {
    it('filtra por pacienteId y oculta notasPrivadas cuando el usuario es paciente', async () => {
      repo.find.mockResolvedValue([entradaCompleta()]);

      const resultado = await service.listar(paciente);

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { pacienteId: paciente.id } }),
      );
      expect(resultado[0]).not.toHaveProperty('notasPrivadas');
      expect(resultado[0].resumenPaciente).toBe('Fuiste evaluado, todo en orden');
    });

    it('filtra por medicoId (solo lo que escribió) y muestra notasPrivadas al médico', async () => {
      repo.find.mockResolvedValue([entradaCompleta()]);

      const resultado = await service.listar(medico);

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { medicoId: medico.id } }),
      );
      expect(resultado[0]).toHaveProperty('notasPrivadas', 'Contenido clínico sensible');
    });

    it('no filtra (ve todo, con notasPrivadas) para director y auditor', async () => {
      repo.find.mockResolvedValue([entradaCompleta()]);

      const resultadoDirector = await service.listar(director);
      const resultadoAuditor = await service.listar(auditor);

      expect(resultadoDirector[0]).toHaveProperty('notasPrivadas');
      expect(resultadoAuditor[0]).toHaveProperty('notasPrivadas');
      for (const call of repo.find.mock.calls) {
        expect(call[0].where).toBeUndefined();
      }
    });

    it('devuelve lista vacía para roles sin relación (enfermero)', async () => {
      const resultado = await service.listar(enfermero);

      expect(resultado).toEqual([]);
      expect(repo.find).not.toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.buscarPorId('inexistente', paciente)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('permite al paciente dueño verla, pero oculta notasPrivadas', async () => {
      repo.findOne.mockResolvedValue(entradaCompleta());

      const resultado = await service.buscarPorId('entrada-1', paciente);

      expect(resultado).not.toHaveProperty('notasPrivadas');
      expect(resultado.resumenPaciente).toBe('Fuiste evaluado, todo en orden');
    });

    it('rechaza a otro paciente', async () => {
      repo.findOne.mockResolvedValue(entradaCompleta());

      await expect(service.buscarPorId('entrada-1', otroPaciente)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('permite al médico autor verla con notasPrivadas incluidas', async () => {
      repo.findOne.mockResolvedValue(entradaCompleta());

      const resultado = await service.buscarPorId('entrada-1', medico);

      expect(resultado).toHaveProperty('notasPrivadas', 'Contenido clínico sensible');
    });

    it('rechaza a un médico distinto del autor — sin delegación', async () => {
      repo.findOne.mockResolvedValue(entradaCompleta());

      await expect(service.buscarPorId('entrada-1', otroMedico)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('permite a director y auditor verla con notasPrivadas incluidas', async () => {
      repo.findOne.mockResolvedValue(entradaCompleta());

      const resultadoDirector = await service.buscarPorId('entrada-1', director);
      const resultadoAuditor = await service.buscarPorId('entrada-1', auditor);

      expect(resultadoDirector).toHaveProperty('notasPrivadas');
      expect(resultadoAuditor).toHaveProperty('notasPrivadas');
    });
  });
});
