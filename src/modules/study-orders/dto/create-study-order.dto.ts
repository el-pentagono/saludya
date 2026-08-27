import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStudyOrderDto {
  @ApiProperty({ description: 'ID del paciente destinatario' })
  @IsUUID()
  @IsNotEmpty()
  pacienteId: string;

  @ApiPropertyOptional({ description: 'ID del turno durante el cual se emite la orden' })
  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @ApiProperty({ example: 'Laboratorio de sangre completo' })
  @IsString()
  @IsNotEmpty()
  tipoEstudio: string;

  @ApiProperty({ example: 'Hospital Central - Laboratorio Pabellón B' })
  @IsString()
  @IsNotEmpty()
  lugar: string;

  @ApiProperty({ example: '2026-08-28T08:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  fechaSugerida: string;

  @ApiPropertyOptional({ example: 'Presentarse con 8 horas de ayuno' })
  @IsString()
  @IsOptional()
  indicaciones?: string;
}
