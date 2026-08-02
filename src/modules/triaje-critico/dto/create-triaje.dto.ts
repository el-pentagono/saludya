import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, Length } from 'class-validator';
import { PrioridadTriaje } from '../../../common/enums/prioridad-triaje.enum';

export class CreateTriajeDto {
  @ApiProperty({ description: 'ID del paciente evaluado' })
  @IsUUID(undefined, { message: 'El paciente indicado no es válido' })
  pacienteId: string;

  @ApiProperty({ description: 'Observaciones de la evaluación clínica' })
  @IsString({ message: 'Las observaciones deben ser un texto' })
  @Length(1, 2000, { message: 'Las observaciones deben tener entre 1 y 2000 caracteres' })
  observaciones: string;

  @ApiProperty({ enum: PrioridadTriaje, description: 'Prioridad asignada por el evaluador' })
  @IsEnum(PrioridadTriaje, { message: 'La prioridad indicada no es válida' })
  prioridad: PrioridadTriaje;
}
