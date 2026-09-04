import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @ApiProperty({ required: false, description: 'Número de afiliado a la obra social' })
  @IsOptional()
  @IsString({ message: 'El número de afiliado debe ser un texto' })
  @Length(0, 40, { message: 'El número de afiliado no puede superar los 40 caracteres' })
  numeroAfiliado?: string;
}
