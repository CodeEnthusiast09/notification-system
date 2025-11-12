import { Type } from 'class-transformer';
import {
  IsString,
  IsObject,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { NotificationType } from 'src/types';
import { VariablesDto } from './variable.dto';

export class QueueMessageDto {
  @IsString()
  notification_id: string;

  @IsEnum(NotificationType)
  notification_type: NotificationType;

  @IsString()
  user_id: string;

  @IsString()
  user_email: string;

  @IsString()
  template_code: string;

  @IsString()
  language: string;

  @ValidateNested()
  @Type(() => VariablesDto)
  variables: VariablesDto;

  @IsNumber()
  priority: number;

  @IsString()
  request_id: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  created_at: string;

  @IsNumber()
  retry_count: number;
}
