export const LeaseStatus = {
  DRAFT: 'DRAFT',
  PENDING_SIGNATURES: 'PENDING_SIGNATURES',
  ACTIVE: 'ACTIVE',
  TERMINATED: 'TERMINATED',
  EXPIRED: 'EXPIRED',
} as const;

export type LeaseStatus = (typeof LeaseStatus)[keyof typeof LeaseStatus];
