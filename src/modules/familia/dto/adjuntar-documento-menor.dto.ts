import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdjuntarDocumentoMenorDto {
  @ApiProperty({ description: 'Data URI o URL del documento de respaldo (DNI o Partida)' })
  @IsString({ message: 'documentoUrl debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'documentoUrl es obligatorio' })
  documentoUrl: string;

  @ApiProperty({ description: 'Nombre del archivo', example: 'dni-menor.pdf' })
  @IsString()
  @IsNotEmpty()
  nombreArchivo: string;

  @ApiProperty({
    description: 'Tipo de documento',
    example: 'dni',
    enum: ['dni', 'partida_nacimiento', 'otro'],
  })
  @IsString()
  @IsIn(['dni', 'partida_nacimiento', 'otro'], {
    message: 'tipoDocumento debe ser dni, partida_nacimiento u otro',
  })
  tipoDocumento: string;
}
