import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateVkmDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  shortdescription: string;

  @IsString()
  description: string;

  @IsString()
  content: string;

  @IsNumber()
  studycredit: number;

  @IsString()
  location: string;

  @IsNumber()
  contact_id: number;

  @IsString()
  level: string;

  @IsOptional()
  @IsString()
  learningoutcomes?: string;
}
