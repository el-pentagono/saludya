import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { Rol } from '../../../common/enums/rol.enum';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Length(8, 100)
  password: string;

  @ApiProperty()
  @IsString()
  @Length(2, 80)
  nombre: string;

  @ApiProperty()
  @IsString()
  @Length(2, 80)
  apellido: string;

  @ApiProperty()
  @IsString()
  @Length(7, 10)
  dni: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ enum: Rol, required: false })
  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;

  @ApiProperty({ required: false, description: 'ID de la obra social asignada' })
  @IsOptional()
  @IsUUID()
  obraSocialId?: string;
}
