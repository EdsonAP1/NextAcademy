import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('classrooms')
@UseGuards(AuthGuard)
export class ClassroomsController {
  constructor(private classroomsService: ClassroomsService) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { name: string; capacity: number; branchId?: string },
  ) {
    return this.classroomsService.create(req.user.tenantId, body);
  }

  @Get()
  async findAll(@Req() req: any, @Query('branchId') branchId: string) {
    return this.classroomsService.findAll(req.user.tenantId, branchId);
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { name?: string; capacity?: number },
  ) {
    return this.classroomsService.update(req.user.tenantId, id, body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.classroomsService.remove(req.user.tenantId, id);
  }
}
