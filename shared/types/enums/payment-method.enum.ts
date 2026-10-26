export const PaymentMethod = {
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  CASH: 'CASH',
  CHECK: 'CHECK',
  STRIPE_MOCK: 'STRIPE_MOCK',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
