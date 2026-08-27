import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearConsentimientoDto {
  @ApiProperty({
    description: 'Versión de los términos de privacidad y tratamiento de datos de menores aceptados',
    example: '1.0',
    default: '1.0',
  })
  @IsOptional()
  @IsString({ message: 'versionPolitica debe ser un texto' })
  versionPolitica?: string;

  @ApiProperty({
    description: 'Texto legal completo que fue leído y aceptado por el tutor',
    example: 'Acepto el tratamiento de datos de salud de mi hijo/a menor a cargo...',
  })
  @IsString({ message: 'El texto aceptado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El texto del consentimiento es obligatorio' })
  textoAceptado: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}
