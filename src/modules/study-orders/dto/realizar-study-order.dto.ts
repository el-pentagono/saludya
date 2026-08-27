import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class RealizarStudyOrderDto {
  @ApiPropertyOptional({
    description: 'Fecha y hora sugerida para el turno de control con el médico',
    example: '2026-09-04T10:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  fechaControlSugerida?: string;
}
