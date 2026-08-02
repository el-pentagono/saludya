import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class ConfirmarTranscripcionDto {
  @ApiProperty({ description: 'Diagnóstico que quedará en la historia clínica' })
  @IsString({ message: 'El diagnóstico debe ser un texto' })
  @Length(1, 300, { message: 'El diagnóstico debe tener entre 1 y 300 caracteres' })
  diagnostico: string;

  @ApiProperty({
    required: false,
    description: 'Notas finales, si se editan respecto al resumen automático. Si se omite, se usa el resumen generado.',
  })
  @IsOptional()
  @IsString({ message: 'Las notas finales deben ser un texto' })
  @Length(1, 5000, { message: 'Las notas finales deben tener entre 1 y 5000 caracteres' })
  notasFinales?: string;
}
