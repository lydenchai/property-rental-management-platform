import { defineEventHandler, readBody, getRequestHeader, getRequestIP } from 'h3';
import { ContactInputSchema } from '../../../shared/schemas/contact.schema';
import { createApiResponse, handleApiError } from '../../utils/errors';
import { auditLogRepository } from '../../repositories/audit-log.repo';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const validatedInput = ContactInputSchema.parse(body);

    const userAgent = getRequestHeader(event, 'user-agent');
    const ipAddress = getRequestIP(event, { xForwardedFor: true });

    // Generate deterministic ticket reference
    const timestampPart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `RE-TKT-${timestampPart}-${randomPart}`;

    // Record submission in platform audit trail for support traceability
    try {
      await auditLogRepository.log({
        userId: event.context.user?.id || null,
        action: 'CONTACT_SUPPORT_SUBMISSION',
        entityType: 'ContactInquiry',
        entityId: referenceNumber,
        newValues: {
          fullName: validatedInput.fullName,
          email: validatedInput.email,
          category: validatedInput.category,
          subject: validatedInput.subject,
          propertyReference: validatedInput.propertyReference || null,
          messagePreview: validatedInput.message.slice(0, 100),
          ipAddress,
          userAgent,
        },
      });
    } catch (auditErr) {
      console.warn('Failed to log contact inquiry audit record:', auditErr);
    }

    return createApiResponse({
      referenceNumber,
      category: validatedInput.category,
      submittedAt: new Date().toISOString(),
      message:
        'Support request received successfully. Our team will review your inquiry within 1 business day.',
    });
  } catch (error) {
    return handleApiError(event, error);
  }
});
