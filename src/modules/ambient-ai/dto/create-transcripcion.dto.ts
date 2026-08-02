import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateTranscripcionDto {
  @ApiProperty({ description: 'ID del turno (propio) sobre el que se genera la transcripción' })
  @IsUUID()
  appointmentId: string;

  @ApiProperty({
    required: false,
    description:
      'Texto crudo de la transcripción, si ya existe (ej. de un pipeline de audio externo). Si se omite, se simula.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 20000)
  transcripcionCruda?: string;
}
