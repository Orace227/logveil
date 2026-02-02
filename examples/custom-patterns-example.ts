/**
 * Example: Using Custom Patterns with LogVeil
 *
 * This example demonstrates how to add custom regex patterns for
 * detecting and masking domain-specific sensitive data.
 */

import { Masker, CustomPattern } from "../src/index";

// Define custom patterns for your specific use case
const customPatterns: CustomPattern[] = [
  {
    name: "companyEmployeeId",
    pattern: /^EMP-[A-Z]{2}-\d{4}$/i,
    fieldType: "pii",
    maskingStrategy: "partial",
    description: "Company employee ID format: EMP-XX-1234"
  },
  {
    name: "projectCode",
    pattern: /^PROJ-[A-Z]{3}-\d{3}$/i,
    fieldType: "custom",
    maskingStrategy: "hash",
    description: "Internal project code format: PROJ-ABC-123"
  },
  {
    name: "customerAccount",
    pattern: /^ACC-\d{8}$/i,
    fieldType: "pii",
    customMask: (value: string) => {
      // Custom masking function - show only last 3 digits
      return `ACC-*****${value.slice(-3)}`;
    },
    description: "Customer account number format: ACC-12345678"
  },
  {
    name: "internalApiKey",
    pattern: /^INTERNAL-[A-Z0-9]{32}$/i,
    fieldType: "custom",
    maskingStrategy: "remove",
    description: "Internal API key format: INTERNAL-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  },
  {
    name: "medicalLicenseNumber",
    pattern: /^ML[A-Z]{2}\d{6}$/i,
    fieldType: "phi",
    maskingStrategy: "full",
    description: "Medical license number format: MLXX123456"
  }
];

// Create masker with custom patterns
const masker = new Masker({
  env: "development",
  customPatterns,
  detectPII: true,
  maskStringValues: true
});

// Example data containing custom patterns
const sensitiveData = {
  user: {
    name: "John Doe",
    employeeId: "EMP-US-1234",
    email: "john.doe@company.com",
    accountNumber: "ACC-87654321"
  },
  project: {
    code: "PROJ-ABC-123",
    name: "Secret Project Alpha",
    apiKey: "INTERNAL-A1B2C3D4E5F6789012345678901234AB",
    description: "Contact lead at john.doe@company.com for access"
  },
  medical: {
    doctorId: "MLCA123456",
    patientId: "PAT-789",
    notes: "Patient EMP-NY-5678 needs follow-up"
  },
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: "req-12345"
  }
};

console.log("=== Custom Pattern Masking Demo ===\n");

console.log("Original data:");
console.log(JSON.stringify(sensitiveData, null, 2));

console.log("\n" + "=".repeat(50) + "\n");

// Mask the data
const result = masker.mask(sensitiveData);

console.log("Masked data:");
console.log(JSON.stringify(result.masked, null, 2));

console.log("\n" + "=".repeat(50) + "\n");

console.log("Detection summary:");
console.log(`Fields processed: ${result.fieldsProcessed}`);

if (result.detectedFields) {
  console.log("\nDetected fields:");
  result.detectedFields.forEach((field) => {
    console.log(
      `- ${field.path}: ${field.type} (strategy: ${field.strategy}${field.customPattern ? `, pattern: ${field.customPattern}` : ""})`
    );
  });
}

console.log("\n" + "=".repeat(50) + "\n");

// Demonstrate adding custom patterns at runtime
console.log("Adding new pattern at runtime...\n");

const newPattern: CustomPattern = {
  name: "sessionToken",
  pattern: /^SESSION-[A-F0-9]{40}$/i,
  fieldType: "custom",
  maskingStrategy: "hash",
  description: "Session token format: SESSION-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
};

masker.addCustomPattern(newPattern);

const dataWithSessionToken = {
  user: "john.doe@company.com",
  sessionId: "SESSION-A1B2C3D4E5F6789012345678901234567890ABCD",
  timestamp: Date.now()
};

console.log("Data with new session token:");
console.log(JSON.stringify(dataWithSessionToken, null, 2));

const sessionResult = masker.mask(dataWithSessionToken);

console.log("\nMasked data with new pattern:");
console.log(JSON.stringify(sessionResult.masked, null, 2));

console.log("\n" + "=".repeat(50) + "\n");

// Show all custom patterns
console.log("All registered custom patterns:");
const allPatterns = masker.getCustomPatterns();
allPatterns.forEach((pattern) => {
  console.log(`- ${pattern.name}: ${pattern.description || "No description"}`);
});

console.log("\n=== Demo Complete ===");
