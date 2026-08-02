import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GenerarCertificadoTratamientoDto {
  @ApiProperty({ description: 'ID del tratamiento sobre el que se genera el certificado' })
  @IsUUID(undefined, { message: 'El tratamiento indicado no es válido' })
  treatmentId: string;
}
