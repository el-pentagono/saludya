import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateFollowUpDto {
  @ApiProperty({ description: 'Nota de seguimiento (evolución, adherencia, observaciones)' })
  @IsString({ message: 'La nota debe ser un texto' })
  @Length(1, 2000, { message: 'La nota debe tener entre 1 y 2000 caracteres' })
  nota: string;
}
