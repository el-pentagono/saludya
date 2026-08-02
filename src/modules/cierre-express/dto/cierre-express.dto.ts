import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CierreExpressDto {
  @ApiProperty({ description: 'Diagnóstico breve del cierre' })
  @IsString({ message: 'El diagnóstico debe ser un texto' })
  @Length(1, 300, { message: 'El diagnóstico debe tener entre 1 y 300 caracteres' })
  diagnostico: string;
}
