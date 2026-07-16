import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('branches')
@UseGuards(AuthGuard)
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { name: string; address?: string; phone?: string },
  ) {
    return this.branchesService.create(req.user.tenantId, body);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.branchesService.findAll(req.user.tenantId);
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { name?: string; address?: string; phone?: string },
  ) {
    return this.branchesService.update(req.user.tenantId, id, body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.branchesService.remove(req.user.tenantId, id);
  }
}
