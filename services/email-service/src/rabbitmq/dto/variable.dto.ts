import { IsObject, IsOptional, IsString } from 'class-validator';

export class VariablesDto {
  @IsString()
  name: string;

  @IsString()
  link: string;

  @IsObject()
  @IsOptional()
  meta?: Record<string, any>;
}
