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
import { EnrollmentsService } from './enrollments.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('enrollments')
@UseGuards(AuthGuard)
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { studentId: string; courseId: string; status?: string },
  ) {
    return this.enrollmentsService.create(req.user.tenantId, body);
  }

  @Get()
  async findAll(@Req() req: any, @Query('branchId') branchId: string) {
    return this.enrollmentsService.findAll(req.user.tenantId, branchId);
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status?: string },
  ) {
    return this.enrollmentsService.update(req.user.tenantId, id, body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.enrollmentsService.remove(req.user.tenantId, id);
  }
}
