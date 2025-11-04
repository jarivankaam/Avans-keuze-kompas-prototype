import { Controller, Post, Param } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('all')
  async syncAllToN8n() {
    return this.syncService.sendAllUsersAndVkmToN8n();
  }

  @Post(':userId')
  async syncUserById(@Param('userId') userId: string) {
    return this.syncService.sendUserAndVkmToN8n(userId);
  }
}