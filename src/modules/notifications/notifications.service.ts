import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async crear(
    usuarioId: string,
    titulo: string,
    mensaje: string,
    tipo: string = 'general',
    metadata?: Record<string, any>,
  ): Promise<Notification> {
    const notificacion = this.repo.create({
      usuarioId,
      titulo,
      mensaje,
      tipo,
      metadata: metadata ?? null,
      leida: false,
    });
    return this.repo.save(notificacion);
  }

  async listarPorUsuario(usuarioId: string): Promise<Notification[]> {
    return this.repo.find({
      where: { usuarioId },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async contarNoLeidas(usuarioId: string): Promise<number> {
    return this.repo.count({
      where: { usuarioId, leida: false },
    });
  }

  async marcarLeida(id: string, usuarioId: string): Promise<Notification> {
    const notificacion = await this.repo.findOne({ where: { id, usuarioId } });
    if (!notificacion) {
      throw new NotFoundException(`Notificación ${id} no encontrada`);
    }
    notificacion.leida = true;
    return this.repo.save(notificacion);
  }

  async marcarTodasLeidas(usuarioId: string): Promise<{ actualizadas: number }> {
    const res = await this.repo.update({ usuarioId, leida: false }, { leida: true });
    return { actualizadas: res.affected ?? 0 };
  }
}
