import { invoiceRepository, type InvoiceEntity } from '../repositories/invoice.repo';
import { paymentRepository, type PaymentEntity } from '../repositories/payment.repo';
import { leaseRepository } from '../repositories/lease.repo';
import { propertyRepository } from '../repositories/property.repo';
import { unitRepository } from '../repositories/unit.repo';
import { userRepository } from '../repositories/user.repo';
import { 
  GenerateInvoiceSchema, 
  RecordPaymentSchema, 
  QueryInvoiceSchema, 
  type GenerateInvoiceInput, 
  type RecordPaymentInput, 
  type QueryInvoiceInput 
} from '../../shared/schemas/billing.schema';
import { InvoiceStatus } from '../../shared/types/enums/invoice-status.enum';
import { PaymentStatus } from '../../shared/types/enums/payment-status.enum';
import { createValidationError, createNotFoundError, createForbiddenError } from '../utils/errors';

export class BillingService {
  async generateInvoice(
    user: { id: string; role: string },
    input: GenerateInvoiceInput
  ): Promise<InvoiceEntity> {
    const validated = GenerateInvoiceSchema.parse(input);

    const lease = await leaseRepository.findById(validated.leaseId);
    if (!lease) {
      throw createNotFoundError('Lease agreement not found');
    }

    if (user.role !== 'ADMIN' && lease.landlordId !== user.id) {
      throw createForbiddenError('You do not have permission to issue invoices for this lease');
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const dueDate = new Date(validated.dueDate);
    const now = new Date();

    let initialStatus: any = InvoiceStatus.UNPAID;
    if (dueDate.getTime() < now.getTime()) {
      initialStatus = InvoiceStatus.OVERDUE;
    }

    const invoice = await invoiceRepository.create({
      leaseId: lease.id,
      tenantId: lease.tenantId,
      invoiceNumber,
      amountDue: validated.amountDue,
      amountPaid: 0,
      issueDate: now,
      dueDate,
      status: initialStatus,
      notes: validated.notes,
    });

    const enriched = await this.enrichInvoice(invoice);
    return enriched;
  }

  async recordPayment(
    user: { id: string; role: string },
    input: RecordPaymentInput
  ): Promise<{ payment: PaymentEntity; invoice: InvoiceEntity; receiptNumber: string }> {
    const validated = RecordPaymentSchema.parse(input);

    const invoice = await invoiceRepository.findById(validated.invoiceId);
    if (!invoice) {
      throw createNotFoundError('Invoice not found');
    }

    const lease = await leaseRepository.findById(invoice.leaseId);

    const isTenant = user.role === 'TENANT' && invoice.tenantId === user.id;
    const isLandlord = user.role === 'LANDLORD' && lease?.landlordId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isTenant && !isLandlord && !isAdmin) {
      throw createForbiddenError('You do not have permission to record payments for this invoice');
    }

    const newAmountPaid = Number(invoice.amountPaid) + Number(validated.amount);
    let newStatus = invoice.status;

    if (newAmountPaid >= Number(invoice.amountDue)) {
      newStatus = InvoiceStatus.PAID;
    } else if (newAmountPaid > 0) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    const receiptNumber = `RCPT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const paidAt = validated.paidAt ? new Date(validated.paidAt) : new Date();

    const payment = await paymentRepository.create({
      invoiceId: invoice.id,
      recordedById: user.id,
      amount: validated.amount,
      method: validated.method as any,
      referenceNumber: validated.referenceNumber || null,
      status: PaymentStatus.CONFIRMED,
      paidAt,
      receiptUrl: receiptNumber,
      notes: validated.notes || null,
    });

    const updatedInvoice = await invoiceRepository.update(invoice.id, {
      amountPaid: newAmountPaid,
      status: newStatus,
    });

    const enrichedInvoice = await this.enrichInvoice(updatedInvoice || invoice);

    return {
      payment,
      invoice: enrichedInvoice,
      receiptNumber,
    };
  }

  async listInvoices(
    user: { id: string; role: string },
    filter: QueryInvoiceInput = {}
  ): Promise<InvoiceEntity[]> {
    const validated = QueryInvoiceSchema.parse(filter);

    let invoices: InvoiceEntity[] = [];

    if (user.role === 'TENANT') {
      invoices = await invoiceRepository.findMany({
        ...validated,
        tenantId: user.id,
      });
    } else if (user.role === 'LANDLORD') {
      const landlordLeases = await leaseRepository.findMany({ landlordId: user.id });
      const leaseIds = new Set(landlordLeases.map((l: any) => l.id));

      const allInvoices = await invoiceRepository.findMany(validated);
      invoices = allInvoices.filter((inv) => leaseIds.has(inv.leaseId));
    } else {
      invoices = await invoiceRepository.findMany(validated);
    }

    const now = new Date();
    const enrichedList: InvoiceEntity[] = [];

    for (const inv of invoices) {
      if (
        inv.status === InvoiceStatus.UNPAID &&
        new Date(inv.dueDate).getTime() < now.getTime()
      ) {
        inv.status = InvoiceStatus.OVERDUE;
        await invoiceRepository.update(inv.id, { status: InvoiceStatus.OVERDUE });
      }

      const enriched = await this.enrichInvoice(inv);
      enrichedList.push(enriched);
    }

    return enrichedList;
  }

  async getInvoiceById(
    user: { id: string; role: string },
    id: string
  ): Promise<InvoiceEntity> {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw createNotFoundError('Invoice not found');
    }

    const lease = await leaseRepository.findById(invoice.leaseId);
    const isTenant = user.role === 'TENANT' && invoice.tenantId === user.id;
    const isLandlord = user.role === 'LANDLORD' && lease?.landlordId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isTenant && !isLandlord && !isAdmin) {
      throw createForbiddenError('You do not have access to view this invoice');
    }

    return this.enrichInvoice(invoice);
  }

  async getPaymentReceipt(
    user: { id: string; role: string },
    paymentId: string
  ) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      throw createNotFoundError('Payment record not found');
    }

    const invoice = await invoiceRepository.findById(payment.invoiceId);
    if (!invoice) {
      throw createNotFoundError('Associated invoice not found');
    }

    const lease = await leaseRepository.findById(invoice.leaseId);
    const isTenant = user.role === 'TENANT' && invoice.tenantId === user.id;
    const isLandlord = user.role === 'LANDLORD' && lease?.landlordId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isTenant && !isLandlord && !isAdmin) {
      throw createForbiddenError('You do not have permission to view this receipt');
    }

    const tenant = await userRepository.findById(invoice.tenantId);
    const unit = lease ? await unitRepository.findById(lease.unitId) : null;
    const property = unit ? await propertyRepository.findById(unit.propertyId) : null;
    const landlord = lease ? await userRepository.findById(lease.landlordId) : null;

    const remainingBalance = Math.max(0, Number(invoice.amountDue) - Number(invoice.amountPaid));

    return {
      receiptNumber: payment.receiptUrl || `RCPT-${payment.id.slice(-6)}`,
      paymentId: payment.id,
      paidAt: payment.paidAt,
      amount: payment.amount,
      method: payment.method,
      referenceNumber: payment.referenceNumber,
      status: payment.status,
      notes: payment.notes,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amountDue: invoice.amountDue,
        amountPaid: invoice.amountPaid,
        remainingBalance,
        dueDate: invoice.dueDate,
        status: invoice.status,
      },
      tenant: {
        id: tenant?.id || invoice.tenantId,
        fullName: tenant?.fullName || 'Tenant',
        email: tenant?.email || '',
        phone: tenant?.phone || '',
      },
      landlord: {
        id: landlord?.id || lease?.landlordId || '',
        fullName: landlord?.fullName || 'Property Owner',
        email: landlord?.email || '',
      },
      property: {
        title: property?.title || 'Residential Property',
        unitNumber: unit?.unitNumber || '',
        address: property ? `${property.addressLine1}, ${property.city}, ${property.state}` : '',
      },
    };
  }

  private async enrichInvoice(invoice: InvoiceEntity): Promise<InvoiceEntity> {
    let lease = invoice.lease;
    if (!lease) {
      lease = await leaseRepository.findById(invoice.leaseId);
    }

    let tenant = invoice.tenant;
    if (!tenant) {
      const u = await userRepository.findById(invoice.tenantId);
      if (u) {
        tenant = {
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
        };
      }
    }

    let unit = lease?.unit;
    let property = lease?.unit?.property;
    let landlord = lease?.landlord;

    if (lease && !unit) {
      const u = await unitRepository.findById(lease.unitId);
      if (u) {
        unit = u;
        if (!property) {
          property = await propertyRepository.findById(u.propertyId);
        }
      }
    }

    if (lease && !landlord) {
      const l = await userRepository.findById(lease.landlordId);
      if (l) {
        landlord = {
          id: l.id,
          fullName: l.fullName,
          email: l.email,
          phone: l.phone,
        };
      }
    }

    const payments = await paymentRepository.findMany({ invoiceId: invoice.id });

    return {
      ...invoice,
      lease: lease ? {
        ...lease,
        unit: unit ? { ...unit, property } : undefined,
        landlord,
      } : undefined,
      tenant,
      payments,
    };
  }
}

export const billingService = new BillingService();
