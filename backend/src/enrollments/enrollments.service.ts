import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    data: { studentId: string; courseId: string; status?: string },
  ) {
    return this.prisma.enrollment.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        status: data.status || 'CONFIRMED',
        tenantId,
      },
      include: {
        student: true,
        course: true,
      },
    });
  }

  async findAll(tenantId: string, branchId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        tenantId,
        course: {
          branchId,
        },
      },
      include: {
        student: true,
        course: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(tenantId: string, id: string, data: { status?: string }) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id, tenantId },
    });
    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    return this.prisma.enrollment.update({
      where: { id },
      data: {
        status: data.status,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id, tenantId },
    });
    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    return this.prisma.enrollment.delete({
      where: { id },
    });
  }
}
