import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ScheduleInput {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  classroomId: string;
}

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    data: {
      name: string;
      teacher: string;
      capacity: number;
      price: number;
      status?: string;
      branchId: string;
      schedules?: ScheduleInput[];
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          name: data.name,
          teacher: data.teacher,
          capacity: data.capacity,
          price: data.price,
          status: data.status || 'ACTIVE',
          branchId: data.branchId,
          tenantId,
        },
      });

      if (data.schedules && data.schedules.length > 0) {
        await tx.schedule.createMany({
          data: data.schedules.map((s) => ({
            courseId: course.id,
            classroomId: s.classroomId,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            tenantId,
          })),
        });
      }

      return tx.course.findUnique({
        where: { id: course.id },
        include: {
          schedules: {
            include: {
              classroom: true,
            },
          },
        },
      });
    });
  }

  async findAll(tenantId: string, branchId: string) {
    return this.prisma.course.findMany({
      where: { tenantId, branchId },
      include: {
        schedules: {
          include: {
            classroom: true,
          },
        },
        enrollments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: {
      name?: string;
      teacher?: string;
      capacity?: number;
      price?: number;
      status?: string;
      schedules?: ScheduleInput[];
    },
  ) {
    const course = await this.prisma.course.findFirst({
      where: { id, tenantId },
    });
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.course.update({
        where: { id },
        data: {
          name: data.name,
          teacher: data.teacher,
          capacity: data.capacity,
          price: data.price,
          status: data.status,
        },
      });

      if (data.schedules) {
        // Borrar horarios viejos
        await tx.schedule.deleteMany({
          where: { courseId: id },
        });

        // Crear horarios nuevos
        if (data.schedules.length > 0) {
          await tx.schedule.createMany({
            data: data.schedules.map((s) => ({
              courseId: id,
              classroomId: s.classroomId,
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              tenantId,
            })),
          });
        }
      }

      return tx.course.findUnique({
        where: { id },
        include: {
          schedules: {
            include: {
              classroom: true,
            },
          },
        },
      });
    });
  }

  async remove(tenantId: string, id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, tenantId },
    });
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }
}
