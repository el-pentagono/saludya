import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GenerarConstanciaAtencionDto {
  @ApiProperty({ description: 'ID del turno sobre el que se genera la constancia' })
  @IsUUID(undefined, { message: 'El turno indicado no es válido' })
  appointmentId: string;
}
