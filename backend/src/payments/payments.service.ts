import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // --- Payments / Receipts ---

  async createPayment(
    tenantId: string,
    data: {
      enrollmentId: string;
      amount: number;
      paymentMethod: string;
      invoiceNumber: string;
      nit?: string;
      razonSocial?: string;
      cuf?: string;
      controlCode?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el pago
      const payment = await tx.payment.create({
        data: {
          enrollmentId: data.enrollmentId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          invoiceNumber: data.invoiceNumber,
          cuf: data.cuf,
          nit: data.nit,
          razonSocial: data.razonSocial,
          controlCode: data.controlCode,
          tenantId,
        },
        include: {
          enrollment: {
            include: {
              student: true,
              course: true,
            },
          },
        },
      });

      // 2. Crear la transacción de caja automática
      const enrollment = payment.enrollment;
      const concept = `Cobro Curso: ${enrollment.course.name} - ${enrollment.student.name}`;
      const branchId = enrollment.course.branchId || 'principal';

      await tx.cashTransaction.create({
        data: {
          type: 'income',
          concept,
          amount: data.amount,
          method: data.paymentMethod,
          date: new Date().toISOString().split('T')[0],
          branchId,
          tenantId,
        },
      });

      return payment;
    });
  }

  async findAllPayments(tenantId: string, branchId: string) {
    return this.prisma.payment.findMany({
      where: {
        tenantId,
        enrollment: {
          course: {
            branchId,
          },
        },
      },
      include: {
        enrollment: {
          include: {
            student: true,
            course: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- Cash Transactions ---

  async createTransaction(
    tenantId: string,
    data: {
      type: string;
      concept: string;
      amount: number;
      method: string;
      date: string;
      branchId: string;
    },
  ) {
    return this.prisma.cashTransaction.create({
      data: {
        type: data.type,
        concept: data.concept,
        amount: data.amount,
        method: data.method,
        date: data.date,
        branchId: data.branchId,
        tenantId,
      },
    });
  }

  async findAllTransactions(tenantId: string, branchId: string) {
    return this.prisma.cashTransaction.findMany({
      where: { tenantId, branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTransaction(
    tenantId: string,
    id: string,
    data: { concept?: string; amount?: number; method?: string; isCanceled?: boolean },
  ) {
    const tx = await this.prisma.cashTransaction.findFirst({
      where: { id, tenantId },
    });
    if (!tx) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return this.prisma.cashTransaction.update({
      where: { id },
      data: {
        concept: data.concept,
        amount: data.amount,
        method: data.method,
        isCanceled: data.isCanceled,
      },
    });
  }

  async removeTransaction(tenantId: string, id: string) {
    const tx = await this.prisma.cashTransaction.findFirst({
      where: { id, tenantId },
    });
    if (!tx) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return this.prisma.cashTransaction.delete({
      where: { id },
    });
  }
}
