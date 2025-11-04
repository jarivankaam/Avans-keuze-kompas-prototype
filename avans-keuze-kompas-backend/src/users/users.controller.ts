import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MongoIdPipe } from '../common/pipes/mongo-id.pipe';
import { RecommendVkmsDto } from './dto/recommend-vkms.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', MongoIdPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() dto: Partial<CreateUserDto>,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', MongoIdPipe) id: string) {
    return this.service.delete(id);
  }

  @Post(':id/recommend')
  updateRecommendedVkms(
    @Param('id', MongoIdPipe) id: string,
    @Body() body: RecommendVkmsDto,
  ) {
    return this.service.setRecommendedVkms(id, body.vkmIds);
  }
}
