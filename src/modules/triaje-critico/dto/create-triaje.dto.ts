import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, Length } from 'class-validator';
import { PrioridadTriaje } from '../../../common/enums/prioridad-triaje.enum';

export class CreateTriajeDto {
  @ApiProperty({ description: 'ID del paciente evaluado' })
  @IsUUID()
  pacienteId: string;

  @ApiProperty({ description: 'Observaciones de la evaluación clínica' })
  @IsString()
  @Length(1, 2000)
  observaciones: string;

  @ApiProperty({ enum: PrioridadTriaje, description: 'Prioridad asignada por el evaluador' })
  @IsEnum(PrioridadTriaje)
  prioridad: PrioridadTriaje;
}
