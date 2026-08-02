import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class CreateRegistroSaludMentalDto {
  @ApiProperty({ description: 'ID del paciente al que corresponde la entrada' })
  @IsUUID()
  pacienteId: string;

  @ApiProperty({
    description: 'Notas clínicas privadas — visibles solo para el médico autor, director y auditor',
  })
  @IsString()
  @Length(1, 5000)
  notasPrivadas: string;

  @ApiProperty({ description: 'Resumen para el paciente — lo único que verá el paciente' })
  @IsString()
  @Length(1, 2000)
  resumenPaciente: string;
}
