/**
 * Example using the core masker directly
 */

import { createMasker, mask } from '../src';

console.log('=== LogVeil Core Examples ===\n');

// Example 1: Quick one-off masking
console.log('1. Quick Masking:');
const quickData = {
  email: 'user@example.com',
  phone: '+1-555-9876',
  message: 'Hello world'
};
console.log('Original:', quickData);
console.log('Masked:', mask(quickData, { env: 'production', piiFields: ['email', 'phone'] }));
console.log('');

// Example 2: Reusable masker with auto-detection
console.log('2. Auto-Detection:');
const masker = createMasker({
  env: 'production',
  detectPII: true
});

const userData = {
  name: 'John Doe',
  email: 'john.doe@gmail.com', // Auto-detected as PII
  phone: '+919999999999', // Auto-detected as PII
  ssn: '123-45-6789', // Auto-detected as PII
  age: 30
};

const result = masker.mask(userData);
console.log('Original:', userData);
console.log('Masked:', result.masked);
console.log('Fields processed:', result.fieldsProcessed);
console.log('');

// Example 3: Different environments
console.log('3. Environment-Based Masking:');
const testData = { email: 'test@example.com' };

const devMasker = createMasker({ env: 'development', piiFields: ['email'] });
const prodMasker = createMasker({ env: 'production', piiFields: ['email'] });

console.log('Development:', devMasker.mask(testData).masked);
console.log('Production:', prodMasker.mask(testData).masked);
console.log('');

// Example 4: Custom masking rules
console.log('4. Custom Masking Functions:');
const customMasker = createMasker({
  maskingRules: [
    {
      field: 'creditCard',
      strategy: 'partial',
      customMask: (value) => {
        const cleaned = value.replace(/\D/g, '');
        return `****-****-****-${cleaned.slice(-4)}`;
      }
    },
    {
      field: 'dateOfBirth',
      strategy: 'partial',
      customMask: (value) => {
        const [year] = value.split('-');
        return `${year}-**-**`;
      }
    }
  ]
});

const paymentData = {
  creditCard: '4532123456789010',
  dateOfBirth: '1990-05-15',
  name: 'Jane Smith'
};

console.log('Original:', paymentData);
console.log('Masked:', customMasker.mask(paymentData).masked);
console.log('');

// Example 5: Nested objects and arrays
console.log('5. Deep Object Traversal:');
const complexData = {
  users: [
    {
      id: 1,
      email: 'alice@example.com',
      profile: {
        phone: '+1-555-0001',
        address: { city: 'New York' }
      }
    },
    {
      id: 2,
      email: 'bob@example.com',
      profile: {
        phone: '+1-555-0002',
        address: { city: 'San Francisco' }
      }
    }
  ]
};

const deepMasker = createMasker({
  env: 'production',
  piiFields: ['email', 'phone']
});

console.log('Original:', JSON.stringify(complexData, null, 2));
console.log('Masked:', JSON.stringify(deepMasker.mask(complexData).masked, null, 2));
console.log('');

// Example 6: PHI data masking
console.log('6. Healthcare PHI Masking:');
const healthMasker = createMasker({
  env: 'production',
  phiFields: ['patientId', 'diagnosis', 'medication', 'medicalRecordNumber'],
  piiFields: ['email', 'ssn']
});

const patientData = {
  patientId: 'PAT-12345',
  name: 'John Patient',
  email: 'john.patient@email.com',
  diagnosis: 'Type 2 Diabetes',
  medication: 'Metformin 500mg',
  medicalRecordNumber: 'MRN-98765',
  lastVisit: '2026-01-15'
};

const healthResult = healthMasker.mask(patientData);
console.log('Original:', patientData);
console.log('Masked:', healthResult.masked);
console.log(
  'Detected fields:',
  healthResult.detectedFields?.map((f) => ({
    path: f.path,
    type: f.type,
    strategy: f.strategy
  }))
);
console.log('');

// Example 7: RegExp field patterns
console.log('7. RegExp Field Patterns:');
const regexMasker = createMasker({
  env: 'production',
  piiFields: [
    /.*password.*/i, // Matches: password, userPassword, PASSWORD
    /^api[_-]?key$/i, // Matches: apiKey, api_key, API-KEY
    /token$/i // Matches: authToken, accessToken
  ]
});

const apiData = {
  username: 'developer',
  userPassword: 'secret123',
  apiKey: 'sk_live_abc123',
  accessToken: 'eyJhbGci...',
  requestId: 'req-789'
};

console.log('Original:', apiData);
console.log('Masked:', regexMasker.mask(apiData).masked);

console.log('\n✅ Examples completed!');
