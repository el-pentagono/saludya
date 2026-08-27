import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ActualizarSaludMenorDto {
  @ApiProperty({ description: 'Grupo sanguíneo (ej: 0+, A+, etc.)', required: false })
  @IsOptional()
  @IsString()
  grupoSanguineo?: string;

  @ApiProperty({ description: 'Alergias o intolerancias', required: false })
  @IsOptional()
  @IsString()
  alergias?: string;

  @ApiProperty({ description: 'Antecedentes clínicos o diagnósticos pediátricos', required: false })
  @IsOptional()
  @IsString()
  antecedentes?: string;

  @ApiProperty({ description: 'Pediatra de cabecera', required: false })
  @IsOptional()
  @IsString()
  pediatraCabecera?: string;
}
