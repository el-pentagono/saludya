import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateFollowUpDto {
  @ApiProperty({ description: 'Nota de seguimiento (evolución, adherencia, observaciones)' })
  @IsString()
  @Length(1, 2000)
  nota: string;
}
