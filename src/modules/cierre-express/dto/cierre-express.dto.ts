import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CierreExpressDto {
  @ApiProperty({ description: 'Diagnóstico breve del cierre' })
  @IsString()
  @Length(1, 300)
  diagnostico: string;
}
