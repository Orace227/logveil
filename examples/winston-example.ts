/**
 * Example usage of LogVeil with Winston
 */

import winston from 'winston';
import { createMaskedWinstonLogger } from '../src';

// Create base Winston logger
const baseLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    })
  ]
});

// Wrap with LogVeil masking
const logger = createMaskedWinstonLogger({
  logger: baseLogger,
  env: 'production',
  piiFields: ['email', 'phone', 'ssn', 'creditCard'],
  phiFields: ['patientId', 'diagnosis', 'medication'],
  detectPII: true,
  maskingRules: [
    {
      field: 'creditCard',
      strategy: 'partial',
      customMask: (value: string) => {
        const last4 = value.slice(-4);
        return `****-****-****-${last4}`;
      }
    }
  ]
});

// Example 1: User registration
logger.info('User registered', {
  userId: 'user-123',
  email: 'john.doe@example.com',
  phone: '+1-555-123-4567',
  role: 'customer'
});

// Example 2: Healthcare data
logger.info('Patient record accessed', {
  patientId: 'PAT-98765',
  diagnosis: 'Hypertension',
  medication: 'Lisinopril 10mg',
  accessedBy: 'Dr. Smith',
  timestamp: new Date()
});

// Example 3: Payment processing
logger.info('Payment processed', {
  orderId: 'ORD-456',
  amount: 99.99,
  creditCard: '4532-1234-5678-9010',
  email: 'customer@example.com'
});

// Example 4: Nested object
logger.info('Complex user data', {
  user: {
    profile: {
      email: 'alice@company.com',
      phone: '+44-20-1234-5678',
      preferences: {
        notifications: true
      }
    },
    billing: {
      creditCard: '5555-4444-3333-2222',
      address: '123 Main St'
    }
  },
  contacts: [
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Charlie', email: 'charlie@example.com' }
  ]
});

console.log('\n✅ Check the console output above to see masked sensitive data!');
