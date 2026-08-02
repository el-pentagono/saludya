import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { Rol } from '../../../common/enums/rol.enum';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'La contraseña debe ser un texto' })
  @Length(8, 100, { message: 'La contraseña debe tener entre 8 y 100 caracteres' })
  password: string;

  @ApiProperty()
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(2, 80, { message: 'El nombre debe tener entre 2 y 80 caracteres' })
  nombre: string;

  @ApiProperty()
  @IsString({ message: 'El apellido debe ser un texto' })
  @Length(2, 80, { message: 'El apellido debe tener entre 2 y 80 caracteres' })
  apellido: string;

  @ApiProperty()
  @IsString({ message: 'El DNI debe ser un texto' })
  @Length(7, 10, { message: 'El DNI debe tener entre 7 y 10 caracteres' })
  dni: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  telefono?: string;

  @ApiProperty({ enum: Rol, required: false })
  @IsOptional()
  @IsEnum(Rol, { message: 'El rol indicado no es válido' })
  rol?: Rol;

  @ApiProperty({ required: false, description: 'ID de la obra social asignada' })
  @IsOptional()
  @IsUUID(undefined, { message: 'La obra social indicada no es válida' })
  obraSocialId?: string;
}
