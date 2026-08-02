import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class CreateRegistroSaludMentalDto {
  @ApiProperty({ description: 'ID del paciente al que corresponde la entrada' })
  @IsUUID(undefined, { message: 'El paciente indicado no es válido' })
  pacienteId: string;

  @ApiProperty({
    description: 'Notas clínicas privadas — visibles solo para el médico autor, director y auditor',
  })
  @IsString({ message: 'Las notas privadas deben ser un texto' })
  @Length(1, 5000, { message: 'Las notas privadas deben tener entre 1 y 5000 caracteres' })
  notasPrivadas: string;

  @ApiProperty({ description: 'Resumen para el paciente — lo único que verá el paciente' })
  @IsString({ message: 'El resumen debe ser un texto' })
  @Length(1, 2000, { message: 'El resumen debe tener entre 1 y 2000 caracteres' })
  resumenPaciente: string;
}
