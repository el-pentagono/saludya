import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class VincularTurnoDto {
  @ApiProperty({ description: 'ID del turno ya reservado para esta dosis' })
  @IsUUID(undefined, { message: 'El turno indicado no es válido' })
  appointmentId: string;
}
