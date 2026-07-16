import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassroomsService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    data: { name: string; capacity: number; branchId?: string },
  ) {
    return this.prisma.classroom.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        branchId: data.branchId,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, branchId: string) {
    return this.prisma.classroom.findMany({
      where: { tenantId, branchId },
      orderBy: { name: 'asc' },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: { name?: string; capacity?: number },
  ) {
    const classroom = await this.prisma.classroom.findFirst({
      where: { id, tenantId },
    });
    if (!classroom) {
      throw new NotFoundException('Aula no encontrada');
    }

    return this.prisma.classroom.update({
      where: { id },
      data: {
        name: data.name,
        capacity: data.capacity,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const classroom = await this.prisma.classroom.findFirst({
      where: { id, tenantId },
    });
    if (!classroom) {
      throw new NotFoundException('Aula no encontrada');
    }

    return this.prisma.classroom.delete({
      where: { id },
    });
  }
}
