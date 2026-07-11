import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'ciudadano@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ContraseñaSegura123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener mayúsculas, minúsculas y números',
  })
  password: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @Length(2, 80)
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @Length(2, 80)
  apellido: string;

  @ApiProperty({ example: '30123456' })
  @IsString()
  @Length(7, 10)
  dni: string;

  @ApiProperty({ example: '+54 11 1234-5678', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ required: false, description: 'ID de la obra social del paciente' })
  @IsOptional()
  @IsUUID()
  obraSocialId?: string;
}
