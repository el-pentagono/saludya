import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateBloqueDto {
  @ApiProperty({ description: 'Motivo o descripción del bloque (ej. "Trabajo", "Facultad")' })
  @IsString({ message: 'El título debe ser un texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo: string;

  @ApiProperty({ description: 'Indica si se repite todas las semanas ese día', default: true })
  @IsBoolean({ message: 'esRecurrente debe ser un booleano' })
  @IsOptional()
  esRecurrente?: boolean;

  @ApiProperty({
    description: 'Día de la semana (0: Domingo, 1: Lunes ... 6: Sábado). Obligatorio si es recurrente',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'diaSemana debe ser un número entero' })
  @Min(0, { message: 'diaSemana debe ser entre 0 y 6' })
  @Max(6, { message: 'diaSemana debe ser entre 0 y 6' })
  diaSemana?: number;

  @ApiProperty({
    description: 'Fecha puntual (YYYY-MM-DD). Obligatoria si no es recurrente',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'fechaPuntual debe ser un texto' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fechaPuntual debe tener formato YYYY-MM-DD' })
  fechaPuntual?: string;

  @ApiProperty({ description: 'Hora de inicio (HH:mm)', example: '09:00' })
  @IsString({ message: 'horaInicio debe ser un texto' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'horaInicio debe tener formato HH:mm' })
  horaInicio: string;

  @ApiProperty({ description: 'Hora de fin (HH:mm)', example: '12:00' })
  @IsString({ message: 'horaFin debe ser un texto' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'horaFin debe tener formato HH:mm' })
  horaFin: string;
}
