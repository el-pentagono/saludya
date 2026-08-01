import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateTreatmentDto {
  @ApiProperty({ description: 'ID del paciente al que se prescribe el tratamiento' })
  @IsUUID()
  pacienteId: string;

  @ApiProperty({ description: 'Medicamento prescrito' })
  @IsString()
  @Length(1, 200)
  medicamento: string;

  @ApiProperty({ description: 'Dosis y frecuencia' })
  @IsString()
  @Length(1, 200)
  dosis: string;

  @ApiProperty({ required: false, description: 'Indicaciones adicionales' })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  indicaciones?: string;
}
