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
import { CoursesService } from './courses.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('courses')
@UseGuards(AuthGuard)
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Post()
  async create(
    @Req() req: any,
    @Body()
    body: {
      name: string;
      teacher: string;
      capacity: number;
      price: number;
      status?: string;
      branchId: string;
      schedules?: any[];
    },
  ) {
    return this.coursesService.create(req.user.tenantId, body);
  }

  @Get()
  async findAll(@Req() req: any, @Query('branchId') branchId: string) {
    return this.coursesService.findAll(req.user.tenantId, branchId);
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      teacher?: string;
      capacity?: number;
      price?: number;
      status?: string;
      schedules?: any[];
    },
  ) {
    return this.coursesService.update(req.user.tenantId, id, body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.coursesService.remove(req.user.tenantId, id);
  }
}
