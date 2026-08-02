import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ValidarAfiliadoDto {
  @ApiProperty({ example: '0001112223' })
  @IsString({ message: 'El número de afiliado debe ser un texto' })
  @Length(1, 30, { message: 'El número de afiliado debe tener entre 1 y 30 caracteres' })
  numeroAfiliado: string;

  @ApiProperty({ example: '20111222', description: 'DNI del titular' })
  @IsString({ message: 'El DNI debe ser un texto' })
  @Length(7, 10, { message: 'El DNI debe tener entre 7 y 10 caracteres' })
  dni: string;
}
