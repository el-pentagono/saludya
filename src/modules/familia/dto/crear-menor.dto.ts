import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CrearMenorDto {
  @ApiProperty({ description: 'Nombre del menor', example: 'Sofía' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del menor', example: 'Benítez' })
  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @ApiProperty({ description: 'DNI del menor', example: '54123987' })
  @IsString({ message: 'El DNI debe ser un texto' })
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  dni: string;

  @ApiProperty({
    description: 'Fecha de nacimiento (YYYY-MM-DD). Debe ser menor de 16 años',
    example: '2019-05-14',
  })
  @IsString({ message: 'fechaNacimiento debe ser un texto' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fechaNacimiento debe tener formato YYYY-MM-DD',
  })
  fechaNacimiento: string;

  @ApiProperty({
    description: 'Relación o vínculo legal con el menor',
    example: 'madre',
    enum: ['madre', 'padre', 'tutor_legal', 'otro'],
  })
  @IsString({ message: 'La relación debe ser un texto' })
  @IsIn(['madre', 'padre', 'tutor_legal', 'otro'], {
    message: 'relacion debe ser madre, padre, tutor_legal u otro',
  })
  relacion: string;

  @ApiProperty({ description: 'Grupo sanguíneo (opcional)', example: '0+' })
  @IsOptional()
  @IsString()
  grupoSanguineo?: string;

  @ApiProperty({ description: 'Alergias o intolerancias conocidas', required: false })
  @IsOptional()
  @IsString()
  alergias?: string;

  @ApiProperty({ description: 'Antecedentes médicos o patologías previas', required: false })
  @IsOptional()
  @IsString()
  antecedentes?: string;

  @ApiProperty({ description: 'Pediatra de cabecera o centro de salud habitual', required: false })
  @IsOptional()
  @IsString()
  pediatraCabecera?: string;

  @ApiProperty({
    description: 'Documento de respaldo en Data URI o URL (DNI o Partida de Nacimiento). Opcional, no bloqueante',
    required: false,
  })
  @IsOptional()
  @IsString()
  documentoRespaldoUrl?: string;

  @ApiProperty({ description: 'Nombre original del archivo de respaldo', required: false })
  @IsOptional()
  @IsString()
  documentoRespaldoNombre?: string;

  @ApiProperty({
    description: 'Tipo de documento de respaldo',
    example: 'dni',
    enum: ['dni', 'partida_nacimiento', 'otro'],
    required: false,
  })
  @IsOptional()
  @IsString()
  documentoRespaldoTipo?: string;
}
