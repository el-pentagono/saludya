import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateMedicalRecordDto {
  @ApiProperty({ description: 'ID del paciente al que corresponde la entrada' })
  @IsUUID(undefined, { message: 'El paciente indicado no es válido' })
  pacienteId: string;

  @ApiProperty({ description: 'Diagnóstico o motivo de la entrada clínica' })
  @IsString({ message: 'El diagnóstico debe ser un texto' })
  @Length(1, 300, { message: 'El diagnóstico debe tener entre 1 y 300 caracteres' })
  diagnostico: string;

  @ApiProperty({ required: false, description: 'Notas u observaciones adicionales' })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  @Length(1, 5000, { message: 'Las notas deben tener entre 1 y 5000 caracteres' })
  notas?: string;
}
