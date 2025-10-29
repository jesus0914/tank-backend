import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateTankDto {
    
  @IsString()
  name: string;

  @IsNumber()
  level: number;

  @IsNumber()
  liters: number;

  @IsOptional()
  @IsNumber()
  fills?: number;

  @IsOptional()
  @IsBoolean()
  online?: boolean;
}
