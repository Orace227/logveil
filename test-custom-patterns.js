/**
 * Comprehensive tests for LogVeil Custom Pattern functionality
 */

const { Masker } = require("./dist/index");

let testsPassed = 0;
let testsTotal = 0;

function test(name, fn) {
  testsTotal++;
  console.log(`Test ${testsTotal}: ${name}`);
  try {
    fn();
    testsPassed++;
    console.log("PASSED");
  } catch (error) {
    console.log(`FAILED: ${error.message}`);
    console.error(error);
  }
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message || "Assertion failed"}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`
    );
  }
}

function assertContains(str, substring, message) {
  if (!str.includes(substring)) {
    throw new Error(
      `${message || "String does not contain expected substring"}\nString: "${str}"\nExpected to contain: "${substring}"`
    );
  }
}

function assertNotContains(str, substring, message) {
  if (str.includes(substring)) {
    throw new Error(
      `${message || "String contains unexpected substring"}\nString: "${str}"\nShould not contain: "${substring}"`
    );
  }
}

console.log("Running Custom Pattern Tests...\n");

// Test 1: Basic Custom Pattern Creation
test("Basic Custom Pattern Creation", () => {
  const customPatterns = [
    {
      name: "employeeId",
      pattern: /^EMP-\d{6}$/i,
      fieldType: "pii",
      maskingStrategy: "partial"
    }
  ];

  const masker = new Masker({
    env: "development",
    customPatterns,
    detectPII: true
  });

  const patterns = masker.getCustomPatterns();
  assertEqual(patterns.length, 1, "Should have 1 custom pattern");
  assertEqual(patterns[0].name, "employeeId", "Pattern name should match");
  assertEqual(patterns[0].fieldType, "pii", "Pattern field type should match");
});

// Test 2: Custom Pattern Field Detection
test("Custom Pattern Field Detection", () => {
  const customPatterns = [
    {
      name: "employeeId",
      pattern: /^EMP-\d{6}$/i,
      fieldType: "pii",
      maskingStrategy: "partial"
    }
  ];

  const masker = new Masker({
    env: "development",
    customPatterns,
    detectPII: true
  });

  const data = {
    employee: "EMP-123456",
    name: "John Doe",
    email: "john@example.com"
  };

  const result = masker.mask(data);

  assertEqual(result.fieldsProcessed, 2, "Should detect 2 fields (employee + email)");
  assertEqual(result.masked.employee, "EM****", "Employee ID should be partially masked");
  assertEqual(result.masked.name, "John Doe", "Name should not be masked");

  // Check detection details
  const employeeField = result.detectedFields?.find((f) => f.path === "employee");
  assertEqual(employeeField?.customPattern, "employeeId", "Should identify custom pattern");
  assertEqual(employeeField?.strategy, "partial", "Should use custom strategy");
});

// Test 3: Custom Pattern with Custom Masking Function
test("Custom Pattern with Custom Masking Function", () => {
  const customPatterns = [
    {
      name: "accountNumber",
      pattern: /^ACC-\d{8}$/i,
      fieldType: "pii",
      customMask: (value) => `ACC-****${value.slice(-4)}`
    }
  ];

  const masker = new Masker({
    env: "production",
    customPatterns
  });

  const data = {
    account: "ACC-98765432"
  };

  const result = masker.mask(data);
  assertEqual(result.masked.account, "ACC-****5432", "Should use custom masking function");

  const accountField = result.detectedFields?.[0];
  assertEqual(accountField?.strategy, "custom", "Should mark strategy as custom");
});

// Test 4: String Value Masking with Custom Patterns
test("String Value Masking with Custom Patterns", () => {
  const customPatterns = [
    {
      name: "projectCode",
      pattern: /^PROJ-[A-Z]{3}-\d{3}$/i,
      fieldType: "custom",
      maskingStrategy: "hash"
    }
  ];

  const masker = new Masker({
    env: "development",
    customPatterns,
    maskStringValues: true
  });

  const data = {
    description: "Working on PROJ-ABC-123 with team",
    notes: "Projects PROJ-XYZ-456 and PROJ-DEF-789 are related"
  };

  const result = masker.mask(data);

  // Should mask embedded patterns in strings
  assertContains(
    result.masked.description,
    "<hashed:",
    "Description should contain hashed project code"
  );
  assertNotContains(
    result.masked.description,
    "PROJ-ABC-123",
    "Original project code should be masked"
  );
  assertContains(result.masked.description, "with team", "Surrounding text should be preserved");

  assertContains(result.masked.notes, "<hashed:", "Notes should contain hashed project codes");
  assertNotContains(result.masked.notes, "PROJ-XYZ-456", "First project code should be masked");
  assertNotContains(result.masked.notes, "PROJ-DEF-789", "Second project code should be masked");
});

// Test 5: Custom Pattern Priority Over Built-in Detection
test("Custom Pattern Priority Over Built-in Detection", () => {
  const customPatterns = [
    {
      name: "specialEmail",
      pattern: /^[a-z]+@company\.com$/i,
      fieldType: "custom",
      maskingStrategy: "full",
      description: "Company email with special handling"
    }
  ];

  const masker = new Masker({
    env: "development",
    customPatterns,
    detectPII: true
  });

  const data = {
    email1: "john@company.com", // Matches custom pattern
    email2: "john@gmail.com" // Matches built-in pattern
  };

  const result = masker.mask(data);

  assertEqual(
    result.masked.email1,
    "********",
    "Company email should use full masking (custom pattern)"
  );
  assertEqual(
    result.masked.email2,
    "j****@gmail.com",
    "Gmail should use partial masking (built-in)"
  );

  const customEmail = result.detectedFields?.find((f) => f.path === "email1");
  const builtinEmail = result.detectedFields?.find((f) => f.path === "email2");

  assertEqual(customEmail?.customPattern, "specialEmail", "Should identify custom pattern");
  assertEqual(builtinEmail?.customPattern, undefined, "Built-in should not have custom pattern");
});

// Test 6: Runtime Pattern Management
test("Runtime Pattern Management", () => {
  const masker = new Masker({
    env: "development",
    customPatterns: []
  });

  // Initially no custom patterns
  assertEqual(masker.getCustomPatterns().length, 0, "Should start with no custom patterns");

  // Add pattern
  masker.addCustomPattern({
    name: "sessionToken",
    pattern: /^SESSION-[A-F0-9]{32}$/i,
    fieldType: "custom",
    maskingStrategy: "remove"
  });

  assertEqual(masker.getCustomPatterns().length, 1, "Should have 1 pattern after adding");

  // Test the new pattern
  const data = { session: "SESSION-ABCD1234567890ABCDEF1234567890AB" };
  const result = masker.mask(data);
  assertEqual(result.masked.session, "<removed>", "Should remove session token");

  // Remove pattern
  const removed = masker.removeCustomPattern("sessionToken");
  assertEqual(removed, true, "Should successfully remove pattern");
  assertEqual(masker.getCustomPatterns().length, 0, "Should have no patterns after removal");

  // Clear patterns
  masker.addCustomPattern({
    name: "test1",
    pattern: /test1/,
    fieldType: "custom"
  });
  masker.addCustomPattern({
    name: "test2",
    pattern: /test2/,
    fieldType: "custom"
  });

  assertEqual(masker.getCustomPatterns().length, 2, "Should have 2 patterns before clear");
  masker.clearCustomPatterns();
  assertEqual(masker.getCustomPatterns().length, 0, "Should have no patterns after clear");
});

// Test 7: Custom Pattern Error Handling
test("Custom Pattern Error Handling", () => {
  const masker = new Masker({
    customPatterns: [
      {
        name: "test",
        pattern: /test/,
        fieldType: "custom"
      }
    ]
  });

  // Try to add duplicate pattern name
  let errorThrown = false;
  try {
    masker.addCustomPattern({
      name: "test", // Same name
      pattern: /different/,
      fieldType: "pii"
    });
  } catch (error) {
    errorThrown = true;
    assertContains(
      error.message,
      "already exists",
      "Should throw meaningful error for duplicate name"
    );
  }

  if (!errorThrown) {
    throw new Error("Should throw error for duplicate pattern name");
  }
});

// Test 8: Environment-Based Strategy Defaults
test("Environment-Based Strategy Defaults for Custom Patterns", () => {
  const customPatterns = [
    {
      name: "deviceId",
      pattern: /^DEV-[A-Z0-9]{8}$/i,
      fieldType: "pii"
      // No maskingStrategy specified - should use environment default
    }
  ];

  const devMasker = new Masker({
    env: "development",
    customPatterns
  });

  const prodMasker = new Masker({
    env: "production",
    customPatterns
  });

  const data = { device: "DEV-ABCD1234" };

  const devResult = devMasker.mask(data);
  const prodResult = prodMasker.mask(data);

  assertEqual(devResult.masked.device, "DE****", "Development should use partial masking");
  assertContains(prodResult.masked.device, "<hashed:", "Production should use hash masking");
});

// Test 9: Multiple Custom Patterns
test("Multiple Custom Patterns Working Together", () => {
  const customPatterns = [
    {
      name: "orderId",
      pattern: /^ORD-\d{10}$/i,
      fieldType: "pii",
      maskingStrategy: "partial"
    },
    {
      name: "trackingNumber",
      pattern: /^TRK[A-Z]{2}\d{8}$/i,
      fieldType: "custom",
      maskingStrategy: "hash"
    },
    {
      name: "customerId",
      pattern: /^CUST\d{6}$/i,
      fieldType: "pii",
      customMask: (value) => `CUST****${value.slice(-2)}`
    }
  ];

  const masker = new Masker({
    env: "production",
    customPatterns
  });

  const data = {
    order: "ORD-1234567890",
    tracking: "TRKAB12345678",
    customer: "CUST123456",
    description: "Order ORD-9876543210 shipped via TRKCD87654321"
  };

  const result = masker.mask(data);

  // Field-level detection
  assertEqual(result.masked.order, "OR****", "Order should be partially masked");
  assertContains(result.masked.tracking, "<hashed:", "Tracking should be hashed");
  assertEqual(result.masked.customer, "CUST****56", "Customer should use custom mask");

  // String-level detection
  assertNotContains(result.masked.description, "ORD-9876543210", "Embedded order should be masked");
  assertNotContains(
    result.masked.description,
    "TRKCD87654321",
    "Embedded tracking should be masked"
  );
  assertContains(result.masked.description, "shipped via", "Description text should be preserved");
});

// Test 10: Field Name vs Pattern Detection Precedence
test("Field Name vs Pattern Detection Precedence", () => {
  const masker = new Masker({
    env: "development",
    piiFields: ["specialField"],
    customPatterns: [
      {
        name: "specialPattern",
        pattern: /^SPECIAL-\d+$/i,
        fieldType: "custom",
        maskingStrategy: "hash"
      }
    ]
  });

  const data = {
    specialField: "SPECIAL-12345", // Matches both field name and pattern
    otherField: "SPECIAL-67890" // Matches only pattern
  };

  const result = masker.mask(data);

  // Field name detection should take precedence for configured fields
  assertEqual(result.masked.specialField, "SP****", "Field name detection should use PII strategy");
  assertContains(
    result.masked.otherField,
    "<hashed:",
    "Pattern detection should use custom strategy"
  );
});

// Test 11: Bug Fix Verification - Field Name False Positives
test("Bug Fix: Field Name False Positives", () => {
  const masker = new Masker({
    env: "development",
    detectPII: true
  });

  const data = {
    description: "This should not be flagged as IP address",
    subscription: "Premium plan",
    transcription: "Meeting notes",
    ipAddress: "192.168.1.1" // This should be detected
  };

  const result = masker.mask(data);

  assertEqual(result.masked.description, data.description, "Description should not be masked");
  assertEqual(result.masked.subscription, data.subscription, "Subscription should not be masked");
  assertEqual(
    result.masked.transcription,
    data.transcription,
    "Transcription should not be masked"
  );
  assertEqual(result.masked.ipAddress, "19****", "IP address should be masked");

  assertEqual(result.fieldsProcessed, 1, "Should only process IP address field");
});

// Test 12: Masking Strategy Optional Behavior
test("Masking Strategy Optional Behavior", () => {
  const customPatterns = [
    {
      name: "apiKey",
      pattern: /^API-[A-Z0-9]{32}$/i,
      fieldType: "custom"
      // No maskingStrategy - should default to 'full' for custom fields
    },
    {
      name: "userId",
      pattern: /^USER-\d{8}$/i,
      fieldType: "pii"
      // No maskingStrategy - should use environment default for PII
    }
  ];

  const masker = new Masker({
    env: "development",
    customPatterns
  });

  const data = {
    api: "API-ABCD1234567890ABCDEF1234567890AB",
    user: "USER-12345678"
  };

  const result = masker.mask(data);

  assertEqual(result.masked.api, "********", "Custom field should default to full masking");
  assertEqual(result.masked.user, "US****", "PII field should use environment default (partial)");
});

// Summary
console.log("\n" + "=".repeat(60));
console.log(`📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);

if (testsPassed === testsTotal) {
  console.log("🎉 All custom pattern tests passed successfully!");
  process.exit(0);
} else {
  console.log(`❌ ${testsTotal - testsPassed} tests failed`);
  process.exit(1);
}
