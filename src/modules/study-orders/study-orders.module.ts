import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { StudyOrder } from './entities/study-order.entity';
import { StudyOrdersController } from './study-orders.controller';
import { StudyOrdersService } from './study-orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyOrder]),
    UsuariosModule,
    NotificationsModule,
  ],
  controllers: [StudyOrdersController],
  providers: [StudyOrdersService],
  exports: [StudyOrdersService],
})
export class StudyOrdersModule {}
