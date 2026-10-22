import { describe, it, expect } from 'vitest';
import { billingService } from '../../server/services/billing.service';
import { leaseRepository } from '../../server/repositories/lease.repo';
import { InvoiceStatus } from '../../shared/types/enums/invoice-status.enum';
import { PaymentMethod } from '../../shared/types/enums/payment-method.enum';

describe('Phase 5: Invoices, Payment Records & Billing Lifecycle', () => {
  const landlordUser = { id: 'user-landlord-01', role: 'LANDLORD' };
  const tenantUser = { id: 'user-tenant-01', role: 'TENANT' };
  const unauthorizedUser = { id: 'user-other-02', role: 'LANDLORD' };

  it('should allow landlord to generate an invoice for an active lease', async () => {
    const futureDueDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

    const invoice = await billingService.generateInvoice(landlordUser, {
      leaseId: 'lease-skyline-101a',
      dueDate: futureDueDate,
      amountDue: 1650,
      notes: 'March 2026 Monthly Rent',
    });

    expect(invoice).toBeDefined();
    expect(invoice.id).toBeDefined();
    expect(invoice.invoiceNumber).toMatch(/^INV-/);
    expect(invoice.amountDue).toBe(1650);
    expect(invoice.amountPaid).toBe(0);
    expect(invoice.status).toBe(InvoiceStatus.UNPAID);
    expect(invoice.notes).toBe('March 2026 Monthly Rent');
  });

  it('should reject invoice generation from an unauthorized landlord', async () => {
    await expect(
      billingService.generateInvoice(unauthorizedUser, {
        leaseId: 'lease-skyline-101a',
        dueDate: new Date().toISOString(),
        amountDue: 1650,
      })
    ).rejects.toThrow();
  });

  it('should record partial payment and update invoice status to PARTIALLY_PAID', async () => {
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const invoice = await billingService.generateInvoice(landlordUser, {
      leaseId: 'lease-skyline-101a',
      dueDate,
      amountDue: 2000,
      notes: 'Testing Partial Payment',
    });

    const paymentResult = await billingService.recordPayment(tenantUser, {
      invoiceId: invoice.id,
      amount: 800,
      method: PaymentMethod.BANK_TRANSFER,
      referenceNumber: 'TXN-PARTIAL-001',
      notes: 'First installment',
    });

    expect(paymentResult.payment).toBeDefined();
    expect(paymentResult.payment.amount).toBe(800);
    expect(paymentResult.invoice.amountPaid).toBe(800);
    expect(paymentResult.invoice.status).toBe(InvoiceStatus.PARTIALLY_PAID);
  });

  it('should record full payment and transition invoice status to PAID', async () => {
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const invoice = await billingService.generateInvoice(landlordUser, {
      leaseId: 'lease-skyline-101a',
      dueDate,
      amountDue: 1200,
      notes: 'Testing Full Payment',
    });

    const paymentResult = await billingService.recordPayment(tenantUser, {
      invoiceId: invoice.id,
      amount: 1200,
      method: PaymentMethod.CREDIT_CARD,
      referenceNumber: 'CARD-AUTH-9942',
      notes: 'Full payment cleared',
    });

    expect(paymentResult.payment.amount).toBe(1200);
    expect(paymentResult.invoice.amountPaid).toBe(1200);
    expect(paymentResult.invoice.status).toBe(InvoiceStatus.PAID);
    expect(paymentResult.receiptNumber).toMatch(/^RCPT-/);
  });

  it('should automatically flag past-due unpaid invoices as OVERDUE', async () => {
    const pastDueDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const invoice = await billingService.generateInvoice(landlordUser, {
      leaseId: 'lease-skyline-101a',
      dueDate: pastDueDate,
      amountDue: 1500,
      notes: 'Overdue Rent Test',
    });

    expect(invoice.status).toBe(InvoiceStatus.OVERDUE);

    const invoices = await billingService.listInvoices(tenantUser);
    const found = invoices.find((i) => i.id === invoice.id);
    expect(found?.status).toBe(InvoiceStatus.OVERDUE);
  });

  it('should retrieve a detailed digital payment receipt with breakdown', async () => {
    const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const invoice = await billingService.generateInvoice(landlordUser, {
      leaseId: 'lease-skyline-101a',
      dueDate,
      amountDue: 1800,
    });

    const paymentResult = await billingService.recordPayment(tenantUser, {
      invoiceId: invoice.id,
      amount: 1800,
      method: PaymentMethod.STRIPE_MOCK,
      referenceNumber: 'STRIPE-CH-7788',
      notes: 'Online card payment',
    });

    const receipt = await billingService.getPaymentReceipt(tenantUser, paymentResult.payment.id);

    expect(receipt).toBeDefined();
    expect(receipt.receiptNumber).toBeDefined();
    expect(receipt.amount).toBe(1800);
    expect(receipt.method).toBe(PaymentMethod.STRIPE_MOCK);
    expect(receipt.invoice.invoiceNumber).toBe(invoice.invoiceNumber);
    expect(receipt.invoice.remainingBalance).toBe(0);
    expect(receipt.tenant.fullName).toBeDefined();
  });
});
