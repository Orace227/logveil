/**
 * Example demonstrating value-level masking feature
 */

const { createMasker } = require('../dist/index');

console.log('=== String Value Masking Examples ===\n');

// Example 1: Development mode (partial masking)
console.log('1. Development Mode (Partial Masking):');
const devMasker = createMasker({
  env: 'development',
  maskStringValues: true
});

const devData = {
  description: 'User email is testing@gmail.com and phone is +919999999999',
  notes: 'Contact support@company.com or call +1-555-1234',
  message: 'SSN: 123-45-6789'
};

const devResult = devMasker.mask(devData);
console.log('Original:', devData.description);
console.log('Masked:', devResult.masked.description);
console.log('');

// Example 2: Production mode (hash masking)
console.log('2. Production Mode (Hash Masking):');
const prodMasker = createMasker({
  env: 'production',
  maskStringValues: true
});

const prodData = {
  description: 'User email is testing@gmail.com and phone is +919999999999',
  notes: 'Card: 4532-1234-5678-9010'
};

const prodResult = prodMasker.mask(prodData);
console.log('Original:', prodData.description);
console.log('Masked:', prodResult.masked.description);
console.log('Original notes:', prodData.notes);
console.log('Masked notes:', prodResult.masked.notes);
console.log('');

// Example 3: Combined field + value masking
console.log('3. Combined Field + Value Masking:');
const combinedMasker = createMasker({
  env: 'development',
  piiFields: ['email', 'phone'],
  maskStringValues: true
});

const combinedData = {
  email: 'john@gmail.com', // Field-level masking
  phone: '+919999999999', // Field-level masking
  description: 'Backup email: backup@gmail.com, alternate phone: +1-555-9999', // Value-level masking
  name: 'John Doe' // Not masked
};

const combinedResult = combinedMasker.mask(combinedData);
console.log('Result:', JSON.stringify(combinedResult.masked, null, 2));
console.log('Total fields processed:', combinedResult.fieldsProcessed);
console.log('');

// Example 4: Disable value masking
console.log('4. Disabled Value Masking (Only Field Names):');
const noValueMasker = createMasker({
  env: 'production',
  piiFields: ['email'],
  maskStringValues: false // Disabled
});

const noValueData = {
  email: 'john@gmail.com', // Will be masked (field name)
  description: 'Email is testing@gmail.com' // Will NOT be masked
};

const noValueResult = noValueMasker.mask(noValueData);
console.log('Result:', JSON.stringify(noValueResult.masked, null, 2));
console.log('');

// Example 5: Nested objects with value masking
console.log('5. Nested Objects:');
const nestedMasker = createMasker({
  env: 'development',
  maskStringValues: true
});

const nestedData = {
  user: {
    profile: {
      bio: 'Software engineer, reach me at dev@company.com'
    },
    contact: {
      instructions: 'Call +1-555-1234 or email support@company.com'
    }
  }
};

const nestedResult = nestedMasker.mask(nestedData);
console.log('Result:', JSON.stringify(nestedResult.masked, null, 2));
console.log('');

// Example 6: Real-world logging scenario
console.log('6. Real-World Logging Scenario:');
const logger = {
  info: (msg, meta) => {
    const masker = createMasker({
      env: 'production',
      piiFields: ['email', 'phone', 'userId'],
      maskStringValues: true
    });
    const masked = masker.mask(meta);
    console.log(`[INFO] ${msg}`, JSON.stringify(masked.masked, null, 2));
  }
};

logger.info('User registration', {
  userId: 'user-123',
  email: 'newuser@example.com',
  message: 'User signed up with email verification@example.com and provided phone +1-555-7890',
  timestamp: new Date().toISOString()
});

console.log('\nAll examples completed!');
