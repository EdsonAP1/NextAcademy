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
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // --- Payments / Receipts ---

  @Post()
  async createPayment(
    @Req() req: any,
    @Body()
    body: {
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
    return this.paymentsService.createPayment(req.user.tenantId, body);
  }

  @Get()
  async findAllPayments(@Req() req: any, @Query('branchId') branchId: string) {
    return this.paymentsService.findAllPayments(req.user.tenantId, branchId);
  }

  // --- Cash Transactions ---

  @Post('transactions')
  async createTransaction(
    @Req() req: any,
    @Body()
    body: {
      type: string;
      concept: string;
      amount: number;
      method: string;
      date: string;
      branchId: string;
    },
  ) {
    return this.paymentsService.createTransaction(req.user.tenantId, body);
  }

  @Get('transactions')
  async findAllTransactions(
    @Req() req: any,
    @Query('branchId') branchId: string,
  ) {
    return this.paymentsService.findAllTransactions(req.user.tenantId, branchId);
  }

  @Patch('transactions/:id')
  async updateTransaction(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { concept?: string; amount?: number; method?: string; isCanceled?: boolean },
  ) {
    return this.paymentsService.updateTransaction(req.user.tenantId, id, body);
  }

  @Delete('transactions/:id')
  async removeTransaction(@Req() req: any, @Param('id') id: string) {
    return this.paymentsService.removeTransaction(req.user.tenantId, id);
  }
}
