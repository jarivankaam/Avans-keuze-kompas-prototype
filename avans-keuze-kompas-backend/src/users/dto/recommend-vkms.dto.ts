import { IsArray, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class RecommendVkmsDto {
  @IsArray()
  @IsMongoId({ each: true })
  @Type(() => String)
  vkmIds: string[];
}
