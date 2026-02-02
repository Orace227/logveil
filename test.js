/**
 * Quick test to verify LogVeil functionality
 */

const { mask, createMasker } = require("./dist/index");

console.log("Testing LogVeil...\n");

// Test 1: Basic masking
console.log("[PASS] Test 1: Basic PII Masking");
const data1 = {
  email: "john@gmail.com",
  phone: "+919999999999",
  name: "John Doe"
};
const masked1 = mask(data1, {
  env: "production",
  piiFields: ["email", "phone"]
});
console.log("Original:", data1);
console.log("Masked:", masked1);
console.log("Immutability check:", data1.email === "john@gmail.com" ? "[PASS]" : "[FAIL]");
console.log("");

// Test 2: Auto-detection
console.log("[PASS] Test 2: Auto-Detection");
const data2 = {
  email: "test@example.com",
  ssn: "123-45-6789",
  message: "Hello"
};
const masker = createMasker({
  env: "production",
  detectPII: true
});
const result = masker.mask(data2);
console.log("Masked:", result.masked);
console.log("Fields detected:", result.fieldsProcessed);
console.log("");

// Test 3: Nested objects
console.log("[PASS] Test 3: Deep Object Traversal");
const data3 = {
  user: {
    profile: {
      email: "nested@example.com"
    }
  }
};
const masked3 = mask(data3, {
  env: "production",
  piiFields: ["email"]
});
console.log("Masked:", JSON.stringify(masked3, null, 2));
console.log("");

// Test 4: Different environments
console.log("[PASS] Test 4: Environment-Based Masking");
const devMasker = createMasker({ env: "development", piiFields: ["email"] });
const prodMasker = createMasker({ env: "production", piiFields: ["email"] });
const testData = { email: "test@example.com" };
console.log("Development:", devMasker.mask(testData).masked);
console.log("Production:", prodMasker.mask(testData).masked);
console.log("");

// Test 5: PHI data
console.log("[PASS] Test 5: PHI Masking");
const healthData = {
  patientId: "PAT-12345",
  diagnosis: "Hypertension",
  name: "Patient Name"
};
const healthMasker = createMasker({
  env: "production",
  phiFields: ["patientId", "diagnosis"]
});
console.log("Masked:", healthMasker.mask(healthData).masked);
console.log("");

// Test 6: String value masking
console.log("[PASS] Test 6: String Value Masking");
const valueMasker = createMasker({
  env: "development",
  maskStringValues: true
});

const valueData = {
  email: "john@gmail.com",
  description: "User email is testing@gmail.com and phone is +919999999999",
  notes: "SSN: 123-45-6789, Card: 4532-1234-5678-9010",
  message: "Contact at support@company.com or call +1-555-1234"
};

const valueResult = valueMasker.mask(valueData);
console.log("Original description:", valueData.description);
console.log("Masked description:", valueResult.masked.description);
console.log("Original notes:", valueData.notes);
console.log("Masked notes:", valueResult.masked.notes);
console.log("Fields processed:", valueResult.fieldsProcessed);
console.log("");

console.log("All tests completed successfully!");
