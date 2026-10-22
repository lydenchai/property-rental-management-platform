import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateSessionId } from '../../server/utils/session';

describe('Session and Password Utilities', () => {
  it('should generate a 64-character hex session token', () => {
    const token = generateSessionId();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64);
  });

  it('should generate distinct session tokens on subsequent calls', () => {
    const token1 = generateSessionId();
    const token2 = generateSessionId();
    expect(token1).not.toBe(token2);
  });

  it('should hash a password and verify it correctly', () => {
    const rawPassword = 'StrongPassword@2026!';
    const hash = hashPassword(rawPassword);
    
    expect(hash).toContain(':');
    const isValid = verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password against the hash', () => {
    const rawPassword = 'CorrectPassword123!';
    const hash = hashPassword(rawPassword);

    const isWrongValid = verifyPassword('WrongPassword123!', hash);
    expect(isWrongValid).toBe(false);
  });

  it('should handle malformed hash strings gracefully without crashing', () => {
    const isMalformedValid = verifyPassword('test', 'not-a-valid-hash');
    expect(isMalformedValid).toBe(false);
  });
});
