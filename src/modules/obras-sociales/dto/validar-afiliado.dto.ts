import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ValidarAfiliadoDto {
  @ApiProperty({ example: '0001112223' })
  @IsString()
  @Length(1, 30)
  numeroAfiliado: string;

  @ApiProperty({ example: '20111222', description: 'DNI del titular' })
  @IsString()
  @Length(7, 10)
  dni: string;
}
