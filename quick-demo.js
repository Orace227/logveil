/**
 * Quick Demo - Value-Level Masking Feature
 * Run: node quick-demo.js
 */

const { createMasker } = require('./dist/index');

console.log('\nLogVeil v1.1.0 - Value-Level Masking Demo\n');

// Your original example!
console.log('Your Example:');
console.log('─────────────────────────────────────────────────────\n');

const masker = createMasker({
  env: 'development',
  piiFields: ['email', 'phone', 'patientId'],
  maskStringValues: true
});

const logData = {
  email: 'john@gmail.com',
  phone: '+919999999999',
  patientId: 'PAT-12345',
  name: 'John Doe',
  description: "this is user's email testing@gmail.com"
};

console.log('BEFORE masking:');
console.log(JSON.stringify(logData, null, 2));

const result = masker.mask(logData);

console.log('\nAFTER masking:');
console.log(JSON.stringify(result.masked, null, 2));

console.log('\nWhat happened:');
console.log('  [MASKED] email field: Masked (field name)');
console.log('  [MASKED] phone field: Masked (field name)');
console.log('  [MASKED] patientId field: Masked (field name)');
console.log('  [MASKED] description value: testing@gmail.com -> masked (value pattern!)');
console.log('  [OK] name field: NOT masked (not sensitive)');
console.log(`\n  Total fields processed: ${result.fieldsProcessed}`);

console.log('\n─────────────────────────────────────────────────────');
console.log('\nSuccess! String values are now masked too!\n');

// Production example
console.log('Production Mode (Hash):');
console.log('─────────────────────────────────────────────────────\n');

const prodMasker = createMasker({
  env: 'production',
  maskStringValues: true
});

const prodData = {
  notes: 'Contact support@company.com or call +1-555-1234. SSN: 123-45-6789'
};

const prodResult = prodMasker.mask(prodData);

console.log('Original:', prodData.notes);
console.log('Masked:  ', prodResult.masked.notes);
console.log('\nAll PII patterns hashed in production mode!\n');
