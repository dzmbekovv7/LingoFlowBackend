import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsArray()
  targetLanguage?: string[];

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  goals?: string;

  @IsOptional()
  @IsArray()
  interests?: string[];
}
