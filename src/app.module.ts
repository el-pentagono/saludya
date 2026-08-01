import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import shieldaiConfig from './config/shieldai.config';
import tramitexpressConfig from './config/tramitexpress.config';
import { Usuario } from './modules/usuarios/entities/usuario.entity';
import { ObraSocial } from './modules/obras-sociales/entities/obra-social.entity';
import { Appointment } from './modules/appointments/entities/appointment.entity';
import { MedicalRecord } from './modules/medical-records/entities/medical-record.entity';
import { Treatment } from './modules/treatments/entities/treatment.entity';
import { TreatmentFollowUp } from './modules/treatments/entities/treatment-follow-up.entity';
import { Document } from './modules/documents/entities/document.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { ObrasSocialesModule } from './modules/obras-sociales/obras-sociales.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { TeleconsultModule } from './modules/teleconsult/teleconsult.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig, shieldaiConfig, tramitexpressConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get<number>('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        entities: [Usuario, ObraSocial, Appointment, MedicalRecord, Treatment, TreatmentFollowUp, Document],
        synchronize: config.get<boolean>('database.synchronize'),
        logging: config.get<boolean>('database.logging'),
        autoLoadEntities: true,
      }),
    }),
    AuthModule, UsuariosModule, ObrasSocialesModule, AppointmentsModule, MedicalRecordsModule, TeleconsultModule, TreatmentsModule, DocumentsModule, AdminModule,
  ],
})
export class AppModule {}
