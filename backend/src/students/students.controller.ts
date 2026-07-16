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
import { StudentsService } from './students.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('students')
@UseGuards(AuthGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { name: string; email: string; phone: string; status?: string; branchId: string },
  ) {
    return this.studentsService.create(req.user.tenantId, body);
  }

  @Get()
  async findAll(@Req() req: any, @Query('branchId') branchId: string) {
    return this.studentsService.findAll(req.user.tenantId, branchId);
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string; phone?: string; status?: string },
  ) {
    return this.studentsService.update(req.user.tenantId, id, body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.studentsService.remove(req.user.tenantId, id);
  }
}
