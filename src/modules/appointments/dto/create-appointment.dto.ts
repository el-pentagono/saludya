import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID del médico con quien se reserva el turno (opcional si agenda el propio médico)',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'El médico indicado no es válido' })
  medicoId?: string;

  @ApiProperty({
    description: 'ID del paciente para quien se reserva el turno (obligatorio si agenda el médico)',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'El paciente indicado no es válido' })
  pacienteId?: string;

  @ApiProperty({ description: 'Fecha y hora del turno (ISO 8601)' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  fecha: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'El motivo debe ser un texto' })
  @Length(1, 300, { message: 'El motivo debe tener entre 1 y 300 caracteres' })
  motivo?: string;
}
