import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateMedicalRecordDto {
  @ApiProperty({ description: 'ID del paciente al que corresponde la entrada' })
  @IsUUID()
  pacienteId: string;

  @ApiProperty({ description: 'Diagnóstico o motivo de la entrada clínica' })
  @IsString()
  @Length(1, 300)
  diagnostico: string;

  @ApiProperty({ required: false, description: 'Notas u observaciones adicionales' })
  @IsOptional()
  @IsString()
  @Length(1, 5000)
  notas?: string;
}
