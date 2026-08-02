import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateTranscripcionDto {
  @ApiProperty({ description: 'ID del turno (propio) sobre el que se genera la transcripción' })
  @IsUUID(undefined, { message: 'El turno indicado no es válido' })
  appointmentId: string;

  @ApiProperty({
    required: false,
    description:
      'Texto crudo de la transcripción, si ya existe (ej. de un pipeline de audio externo). Si se omite, se simula.',
  })
  @IsOptional()
  @IsString({ message: 'La transcripción cruda debe ser un texto' })
  @Length(1, 20000, { message: 'La transcripción cruda debe tener entre 1 y 20000 caracteres' })
  transcripcionCruda?: string;
}
