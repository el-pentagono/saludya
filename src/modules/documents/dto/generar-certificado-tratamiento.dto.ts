import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GenerarCertificadoTratamientoDto {
  @ApiProperty({ description: 'ID del tratamiento sobre el que se genera el certificado' })
  @IsUUID()
  treatmentId: string;
}
