import { describe, it, expect } from 'vitest';
import { RegisterInputSchema } from '../../shared/schemas/auth.schema';
import { ContactInputSchema, ContactCategorySchema } from '../../shared/schemas/contact.schema';

describe('Public Information & Legal Schemas', () => {
  describe('Registration Terms & Privacy Consent', () => {
    it('should validate registration input with terms consent and version', () => {
      const input = {
        email: 'tenant.kh@rentease.com',
        password: 'SecurePass123!',
        fullName: 'Sophea Pich',
        phone: '+85512345678',
        role: 'TENANT',
        termsAccepted: true,
        termsVersion: 'v1.0-2026',
      };

      const result = RegisterInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.termsAccepted).toBe(true);
        expect(result.data.termsVersion).toBe('v1.0-2026');
      }
    });

    it('should maintain backward compatibility for existing registration flows', () => {
      const legacyInput = {
        email: 'landlord.legacy@rentease.com',
        password: 'Password99!',
        fullName: 'Vannak Lim',
        role: 'LANDLORD',
      };

      const result = RegisterInputSchema.safeParse(legacyInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.termsAccepted).toBeUndefined();
      }
    });
  });

  describe('Contact Us Form Validation', () => {
    it('should accept valid contact submissions across all categories', () => {
      const categories = ['GENERAL', 'LANDLORD_ONBOARDING', 'TENANT_SUPPORT', 'TECHNICAL_SECURITY', 'BILLING'] as const;

      for (const category of categories) {
        const input = {
          fullName: 'Bopha Chen',
          email: 'bopha.chen@example.com',
          category,
          propertyReference: 'BKK1 Luxury Suites #402',
          subject: 'Question regarding lease execution deposit',
          message: 'Hello RentEase team, I would like to inquire about how the security deposit receipt is verified upon mutual signing.',
        };

        const result = ContactInputSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.category).toBe(category);
          expect(result.data.email).toBe('bopha.chen@example.com');
        }
      }
    });

    it('should reject invalid email formats in contact submissions', () => {
      const input = {
        fullName: 'Bopha Chen',
        email: 'not-an-email',
        category: 'GENERAL',
        subject: 'General Question',
        message: 'This is a test message that exceeds ten characters.',
      };

      const result = ContactInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject contact messages that are too short', () => {
      const input = {
        fullName: 'Bopha Chen',
        email: 'valid@example.com',
        category: 'TENANT_SUPPORT',
        subject: 'Help',
        message: 'Short', // Less than 10 characters
      };

      const result = ContactInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject unknown inquiry categories', () => {
      const input = {
        fullName: 'Bopha Chen',
        email: 'valid@example.com',
        category: 'INVALID_CATEGORY',
        subject: 'Help Needed',
        message: 'This is a test inquiry message that is long enough.',
      };

      const result = ContactInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
