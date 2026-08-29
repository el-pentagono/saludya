import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ciudadano@ejemplo.com' })
  // Recorta espacios antes de validar: un email pegado desde el teclado del
  // celular o un autocompletado suele traer un espacio/salto de línea al
  // final, y sin este Transform el ValidationPipe global lo rechazaba con
  // 400 antes de llegar siquiera a AuthService (el usuario ve "credenciales
  // inválidas" en el frontend genérico, pero en realidad el request nunca
  // se procesó).
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({ example: 'contraseña123' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
