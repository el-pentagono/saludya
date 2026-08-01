import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID del médico con quien se reserva el turno' })
  @IsUUID()
  medicoId: string;

  @ApiProperty({ description: 'Fecha y hora del turno (ISO 8601)' })
  @IsDateString()
  fecha: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 300)
  motivo?: string;
}
