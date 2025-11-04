import {
  IsEmail,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsBoolean()
  is_admin: boolean;

  @IsBoolean()
  is_student: boolean;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  profile?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };

  @IsOptional()
  @IsArray()
  @Type(() => String)
  recommended_vkms?: string[]; // Array of VKM ObjectIds
}
