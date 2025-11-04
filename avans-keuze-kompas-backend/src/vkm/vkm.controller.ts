import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { VkmService } from './vkm.service';
import { CreateVkmDto } from './dto/create-vkm.dto';
import { MongoIdPipe } from '../common/pipes/mongo-id.pipe';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.gaurd';

@Controller('vkm')
export class VkmController {
  constructor(private readonly service: VkmService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', MongoIdPipe) id: string) {
    return this.service.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateVkmDto) {
    return this.service.create(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() dto: Partial<CreateVkmDto>,
  ) {
    return this.service.update(id, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id', MongoIdPipe) id: string) {
    return this.service.delete(id);
  }
}
