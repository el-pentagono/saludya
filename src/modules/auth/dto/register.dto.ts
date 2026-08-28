import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'ciudadano@ejemplo.com' })
  // Mismo motivo que en LoginDto: recorta espacios antes de validar.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({ example: 'ContraseñaSegura123!' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener mayúsculas, minúsculas y números',
  })
  password: string;

  @ApiProperty({ example: 'Juan' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(2, 80, { message: 'El nombre debe tener entre 2 y 80 caracteres' })
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString({ message: 'El apellido debe ser un texto' })
  @Length(2, 80, { message: 'El apellido debe tener entre 2 y 80 caracteres' })
  apellido: string;

  @ApiProperty({ example: '30123456' })
  @IsString({ message: 'El DNI debe ser un texto' })
  @Length(7, 10, { message: 'El DNI debe tener entre 7 y 10 caracteres' })
  dni: string;

  @ApiProperty({ example: '+54 11 1234-5678', required: false })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  telefono?: string;

  @ApiProperty({ required: false, description: 'ID de la obra social del paciente' })
  @IsOptional()
  @IsUUID(undefined, { message: 'La obra social indicada no es válida' })
  obraSocialId?: string;

  @ApiProperty({
    required: false,
    description: 'Número de afiliado en la obra social indicada (requerido si se envía obraSocialId)',
  })
  @ValidateIf((dto) => !!dto.obraSocialId)
  @IsString({ message: 'El número de afiliado debe ser un texto' })
  @Length(1, 30, { message: 'El número de afiliado debe tener entre 1 y 30 caracteres' })
  numeroAfiliado?: string;
}
