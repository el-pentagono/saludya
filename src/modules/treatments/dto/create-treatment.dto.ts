import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateTreatmentDto {
  @ApiProperty({ description: 'ID del paciente al que se prescribe el tratamiento' })
  @IsUUID(undefined, { message: 'El paciente indicado no es válido' })
  pacienteId: string;

  @ApiProperty({ description: 'Medicamento prescrito' })
  @IsString({ message: 'El medicamento debe ser un texto' })
  @Length(1, 200, { message: 'El medicamento debe tener entre 1 y 200 caracteres' })
  medicamento: string;

  @ApiProperty({ description: 'Dosis y frecuencia' })
  @IsString({ message: 'La dosis debe ser un texto' })
  @Length(1, 200, { message: 'La dosis debe tener entre 1 y 200 caracteres' })
  dosis: string;

  @ApiProperty({ required: false, description: 'Indicaciones adicionales' })
  @IsOptional()
  @IsString({ message: 'Las indicaciones deben ser un texto' })
  @Length(1, 2000, { message: 'Las indicaciones deben tener entre 1 y 2000 caracteres' })
  indicaciones?: string;
}
