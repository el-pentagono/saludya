import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID del médico con quien se reserva el turno' })
  @IsUUID(undefined, { message: 'El médico indicado no es válido' })
  medicoId: string;

  @ApiProperty({ description: 'Fecha y hora del turno (ISO 8601)' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  fecha: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'El motivo debe ser un texto' })
  @Length(1, 300, { message: 'El motivo debe tener entre 1 y 300 caracteres' })
  motivo?: string;
}
