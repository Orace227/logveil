"use client";

import { useState } from "react";
import { Masker } from "../../../src/core/masker";

interface Example {
  title: string;
  description: string;
  code: string;
  input: any;
}

const examples: Example[] = [
  {
    title: "Basic PII Masking",
    description: "Automatically detect and mask common PII fields like email, phone, and SSN",
    code: `const masker = new Masker({
  env: 'production',
  detectPII: true
});

const data = {
  name: "John Doe",
  email: "john@example.com",
  phone: "555-1234"
};

const masked = masker.mask(data);`,
    input: {
      name: "John Doe",
      email: "john@example.com",
      phone: "555-1234",
      ssn: "123-45-6789"
    }
  },
  {
    title: "Healthcare Data (PHI)",
    description: "Mask protected health information with hash strategy",
    code: `const masker = new Masker({
  env: 'production',
  phiFields: ['patientId', 'diagnosis', 'medications'],
  phiEnvironmentMapping: {
    production: 'hash'
  }
});

const patient = {
  patientId: "P-12345",
  diagnosis: "Type 2 Diabetes",
  medications: ["Metformin"]
};

const masked = masker.mask(patient);`,
    input: {
      patientId: "P-12345",
      diagnosis: "Type 2 Diabetes",
      medications: ["Metformin", "Insulin"],
      dateOfBirth: "1980-05-15"
    }
  },
  {
    title: "Custom Field Rules",
    description: "Define specific masking rules for individual fields",
    code: `const masker = new Masker({
  maskingRules: [
    { field: 'apiKey', strategy: 'full' },
    { field: /token$/i, strategy: 'remove' },
    { field: 'userId', strategy: 'hash' }
  ]
});

const data = {
  apiKey: "sk_live_abc123",
  authToken: "token_xyz",
  userId: "user_42"
};

const masked = masker.mask(data);`,
    input: {
      apiKey: "sk_live_abc123",
      authToken: "token_xyz",
      userId: "user_42",
      sessionToken: "session_secret"
    }
  },
  {
    title: "Nested Objects",
    description: "Mask PII in deeply nested data structures",
    code: `const masker = new Masker({
  env: 'production',
  detectPII: true,
  maskStringValues: true
});

const user = {
  profile: {
    personal: {
      email: "user@example.com",
      address: {
        street: "123 Main St",
        city: "SF"
      }
    }
  }
};

const masked = masker.mask(user);`,
    input: {
      profile: {
        personal: {
          name: "Alice Smith",
          email: "alice@example.com",
          address: {
            street: "123 Main St",
            city: "San Francisco",
            zipCode: "94105"
          }
        },
        preferences: {
          notifications: true
        }
      }
    }
  },
  {
    title: "String Value Masking",
    description: "Detect and mask PII patterns within string values",
    code: `const masker = new Masker({
  env: 'production',
  detectPII: true,
  maskStringValues: true
});

const log = {
  message: "Contact support at help@company.com or call 555-0100",
  description: "User john.doe@email.com reported an issue"
};

const masked = masker.mask(log);`,
    input: {
      message: "Contact support at help@company.com or call 555-0100",
      description: "User john.doe@email.com reported an issue",
      notes: "Credit card ending in 9010 was charged"
    }
  },
  {
    title: "Development vs Production",
    description: "Different masking strategies based on environment",
    code: `const devMasker = new Masker({
  env: 'development',
  piiEnvironmentMapping: {
    development: 'partial',
    production: 'full'
  }
});

const prodMasker = new Masker({
  env: 'production',
  piiEnvironmentMapping: {
    development: 'partial',
    production: 'full'
  }
});

const data = { email: "test@example.com" };

const devResult = devMasker.mask(data);
const prodResult = prodMasker.mask(data);`,
    input: {
      email: "test@example.com",
      phone: "555-1234",
      name: "Test User"
    }
  }
];

export function Examples() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [output, setOutput] = useState("");

  const runExample = (example: Example) => {
    try {
      const masker = new Masker({
        env: "production",
        detectPII: true,
        maskStringValues: true
      });
      const result = masker.mask(example.input);
      setOutput(JSON.stringify(result, null, 2));
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const currentExample = examples[selectedExample];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Example List */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Examples</h2>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedExample(index);
                  runExample(examples[index]);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedExample === index
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                }`}
              >
                <div className="font-medium text-sm">{example.title}</div>
                <div
                  className={`text-xs mt-1 ${
                    selectedExample === index ? "text-blue-100" : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {example.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Example Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Code */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {currentExample.title}
            </h2>
            <button
              onClick={() => runExample(currentExample)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Run Example
            </button>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            {currentExample.description}
          </p>
          <pre className="px-4 py-3 font-mono text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 overflow-x-auto">
            {currentExample.code}
          </pre>
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
            Input Data
          </h3>
          <pre className="px-4 py-3 font-mono text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 overflow-x-auto">
            {JSON.stringify(currentExample.input, null, 2)}
          </pre>
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
            Masked Output
          </h3>
          <pre className="px-4 py-3 font-mono text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 overflow-x-auto min-h-32">
            {output || 'Click "Run Example" to see the output'}
          </pre>
        </div>
      </div>
    </div>
  );
}
