import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    data: { name: string; email: string; phone: string; status?: string; branchId: string },
  ) {
    // Validar correo único por tenant
    const existing = await this.prisma.student.findFirst({
      where: { email: data.email, tenantId },
    });
    if (existing) {
      throw new BadRequestException('El estudiante ya está registrado con este correo');
    }

    return this.prisma.student.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status || 'ACTIVE',
        branchId: data.branchId,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, branchId: string) {
    return this.prisma.student.findMany({
      where: { tenantId, branchId },
      include: {
        enrollments: {
          include: {
            course: true
          }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: { name?: string; email?: string; phone?: string; status?: string },
  ) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Validar que el nuevo correo no esté tomado por otro estudiante en el mismo tenant
    if (data.email && data.email !== student.email) {
      const existing = await this.prisma.student.findFirst({
        where: { email: data.email, tenantId, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException('El correo ya está en uso por otro estudiante');
      }
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return this.prisma.student.delete({
      where: { id },
    });
  }
}
