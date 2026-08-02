import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class ConfirmarTranscripcionDto {
  @ApiProperty({ description: 'Diagnóstico que quedará en la historia clínica' })
  @IsString()
  @Length(1, 300)
  diagnostico: string;

  @ApiProperty({
    required: false,
    description: 'Notas finales, si se editan respecto al resumen automático. Si se omite, se usa el resumen generado.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 5000)
  notasFinales?: string;
}
