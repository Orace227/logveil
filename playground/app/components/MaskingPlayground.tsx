"use client";

import { useState, useEffect } from "react";
import { Masker } from "../../../src/core/masker";
import type { MaskingConfig, MaskingStrategy, Environment } from "../../../src/core/types";

const DEFAULT_INPUT = `{
  "user": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "ssn": "123-45-6789",
    "creditCard": "4532-1234-5678-9010",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "zipCode": "94105",
      "ip": "192.168.1.1"
    }
  },
  "patient": {
    "id": "P-12345",
    "diagnosis": "Type 2 Diabetes",
    "medications": ["Metformin", "Insulin"],
    "dateOfBirth": "1980-05-15"
  },
  "apiKey": "sk_live_1234567890abcdef",
  "description": "Contact me at alice@company.com or call 555-0100"
}`;

export function MaskingPlayground() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [output, setOutput] = useState("");
  const [env, setEnv] = useState<Environment>("production");
  const [detectPII, setDetectPII] = useState(true);
  const [maskStringValues, setMaskStringValues] = useState(true);
  const [piiStrategy, setPiiStrategy] = useState<MaskingStrategy>("partial");
  const [phiStrategy, setPhiStrategy] = useState<MaskingStrategy>("hash");
  const [error, setError] = useState("");

  useEffect(() => {
    maskData();
  }, [input, env, detectPII, maskStringValues, piiStrategy, phiStrategy]);

  const maskData = () => {
    try {
      setError("");
      const inputData = JSON.parse(input);

      const config: MaskingConfig = {
        env,
        detectPII,
        maskStringValues,
        piiEnvironmentMapping: {
          development: "partial",
          staging: "partial",
          production: piiStrategy
        },
        phiEnvironmentMapping: {
          development: "partial",
          staging: "hash",
          production: phiStrategy
        }
      };

      const masker = new Masker(config);
      const masked = masker.mask(inputData);
      setOutput(JSON.stringify(masked, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON input");
      setOutput("");
    }
  };

  const strategies: MaskingStrategy[] = ["partial", "full", "hash", "remove"];
  const environments: Environment[] = ["development", "staging", "production"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration Panel */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Configuration
          </h2>

          <div className="space-y-4">
            {/* Environment */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Environment
              </label>
              <select
                value={env}
                onChange={(e) => setEnv(e.target.value as Environment)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              >
                {environments.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            {/* PII Strategy */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                PII Masking Strategy
              </label>
              <select
                value={piiStrategy}
                onChange={(e) => setPiiStrategy(e.target.value as MaskingStrategy)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              >
                {strategies.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* PHI Strategy */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                PHI Masking Strategy
              </label>
              <select
                value={phiStrategy}
                onChange={(e) => setPhiStrategy(e.target.value as MaskingStrategy)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              >
                {strategies.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-detect PII */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="detectPII"
                checked={detectPII}
                onChange={(e) => setDetectPII(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="detectPII" className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">
                Auto-detect PII patterns
              </label>
            </div>

            {/* Mask String Values */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maskStringValues"
                checked={maskStringValues}
                onChange={(e) => setMaskStringValues(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label
                htmlFor="maskStringValues"
                className="ml-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                Mask values within strings
              </label>
            </div>
          </div>
        </div>

        {/* Input Panel */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Input Data</h2>
            <button
              onClick={() => setInput(DEFAULT_INPUT)}
              className="px-3 py-1 text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              Reset
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-96 px-4 py-3 font-mono text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            spellCheck={false}
          />
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>

      {/* Output Panel */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Masked Output
          </h2>
          <div className="relative">
            <pre className="w-full h-[600px] px-4 py-3 font-mono text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 overflow-auto">
              {output || "Masked data will appear here..."}
            </pre>
            {output && (
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="absolute top-4 right-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>
            )}
          </div>
        </div>

        {/* Strategy Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Masking Strategies</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>
              <strong>partial:</strong> Shows first/last chars (e.g., jo****@email.com)
            </li>
            <li>
              <strong>full:</strong> Completely masks (e.g., ****)
            </li>
            <li>
              <strong>hash:</strong> SHA-256 hash (e.g., &lt;hashed:abc123...&gt;)
            </li>
            <li>
              <strong>remove:</strong> Removes the field entirely
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
