import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class RegistrarAplicacionDto {
  @ApiProperty({
    required: false,
    description: 'Fecha real de aplicación (YYYY-MM-DD). Por defecto, hoy.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de aplicación no es válida' })
  fechaAplicacion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'El lote debe ser un texto' })
  @Length(1, 80, { message: 'El lote debe tener entre 1 y 80 caracteres' })
  loteVacuna?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'El lugar de aplicación debe ser un texto' })
  @Length(1, 150, { message: 'El lugar de aplicación debe tener entre 1 y 150 caracteres' })
  lugarAplicacion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  @Length(0, 500, { message: 'Las notas no pueden superar los 500 caracteres' })
  notas?: string;
}
