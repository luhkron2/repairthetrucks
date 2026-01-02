// Advanced security utilities and hardening
import crypto from 'crypto';
import { ApplicationError, ErrorCode } from './errors';

// Security configuration
export const SECURITY_CONFIG = {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    regenerationThreshold: 2 * 60 * 60 * 1000, // 2 hours
  },
  rateLimiting: {
    strict: { windowMs: 60 * 1000, max: 5 }, // 5 requests per minute
    moderate: { windowMs: 60 * 1000, max: 20 }, // 20 requests per minute
    lenient: { windowMs: 60 * 1000, max: 100 }, // 100 requests per minute
  },
  cors: {
    origins: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },
} as const;

// Advanced encryption utilities
export class EncryptionManager {
  private static masterKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);

  static encrypt(text: string, key?: Buffer): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    const encryptionKey = key || this.masterKey;
    const iv = crypto.randomBytes(SECURITY_CONFIG.encryption.ivLength);
    
    const cipher = crypto.createCipher(
      SECURITY_CONFIG.encryption.algorithm,
      encryptionKey
    );
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  static decrypt(encryptedData: {
    encrypted: string;
    iv: string;
    tag: string;
  }, key?: Buffer): string {
    const encryptionKey = key || this.masterKey;
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = crypto.createDecipher(
      SECURITY_CONFIG.encryption.algorithm,
      encryptionKey
    );
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static hashPassword(password: string, salt?: string): {
    hash: string;
    salt: string;
  } {
    const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, passwordSalt, 100000, 64, 'sha512');
    
    return {
      hash: hash.toString('hex'),
      salt: passwordSalt,
    };
  }

  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashPassword(password, salt);
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(computedHash, 'hex')
    );
  }
}

// Security token utilities
export class SecurityToken {
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateJWTSecret(): string {
    return crypto.randomBytes(64).toString('base64');
  }

  static validateTokenStructure(token: string): boolean {
    return /^[a-zA-Z0-9+/=_-]+$/.test(token) && token.length >= 20;
  }
}

// Input sanitization and validation
export class InputSanitizer {
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(\'|\;\-\-|\;.*\;|\'\s*OR\s*\'.*\'.*\=)/gi,
    /(\*\*|\'\s*\*\s*\')/gi,
  ];

  static sanitizeHTML(input: string): string {
    let sanitized = input;
    
    // Remove XSS patterns
    for (const pattern of this.XSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }
    
    // Remove SQL injection patterns
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }
    
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>\"'&]/g, '');
    
    return sanitized.trim().substring(0, 10000);
  }

  static sanitizeEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = email.toLowerCase().trim().substring(0, 254);
    
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  static sanitizePhone(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Validate Australian phone number format
    if (digits.length === 10 && (digits.startsWith('04') || digits.startsWith('02') || digits.startsWith('03') || digits.startsWith('07') || digits.startsWith('08'))) {
      return digits;
    }
    
    return '';
  }

  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < SECURITY_CONFIG.password.minLength) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.password.minLength} characters long`);
    }
    
    if (SECURITY_CONFIG.password.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (SECURITY_CONFIG.password.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (SECURITY_CONFIG.password.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (SECURITY_CONFIG.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check for common passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password cannot contain common words');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Rate limiting with Redis-like in-memory store
export class AdvancedRateLimit {
  private static stores = new Map<string, Map<string, { count: number; resetTime: number }>>();

  static isRateLimited(
    identifier: string,
    options: typeof SECURITY_CONFIG.rateLimiting.strict
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const store = this.stores.get('default') || new Map();
    this.stores.set('default', store);

    const now = Date.now();
    const key = identifier;
    const record = store.get(key);

    // Clean up expired entries periodically
    if (now % 10000 < 100) { // Every 10 seconds
      for (const [k, v] of store.entries()) {
        if (v.resetTime < now) {
          store.delete(k);
        }
      }
    }

    if (!record || now > record.resetTime) {
      const newRecord = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      store.set(key, newRecord);
      
      return {
        allowed: true,
        remaining: options.max - 1,
        resetTime: newRecord.resetTime,
      };
    }

    if (record.count >= options.max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: options.max - record.count,
      resetTime: record.resetTime,
    };
  }
}

// Security audit logging
export class SecurityAudit {
  static logSecurityEvent(
    event: string,
    details: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const auditLog = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      details,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown',
      userId: details.userId || null,
    };

    // In production, this would go to a secure logging service
    if (process.env.NODE_ENV === 'production') {
      console.error('[SECURITY AUDIT]', auditLog);
    } else {
      console.log('[SECURITY AUDIT]', auditLog);
    }
  }

  static logFailedLogin(ip: string, reason: string): void {
    this.logSecurityEvent('FAILED_LOGIN', { ip, reason }, 'high');
  }

  static logSuspiciousActivity(ip: string, activity: string): void {
    this.logSecurityEvent('SUSPICIOUS_ACTIVITY', { ip, activity }, 'high');
  }

  static logUnauthorizedAccess(ip: string, resource: string): void {
    this.logSecurityEvent('UNAUTHORIZED_ACCESS', { ip, resource }, 'critical');
  }
}