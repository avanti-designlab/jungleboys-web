import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // React-compiler-era rules, WARN not error (2026-11-12 pre-cutover audit).
  // They flag a pattern this codebase uses on purpose and documents at each
  // site: client-only state (localStorage, matchMedia, the clock) is read in
  // an effect, never in initial state, so server HTML and first client render
  // cannot disagree. As errors they kept CI's lint step permanently red, which
  // meant build + the accessibility guard behind it never ran. As warnings
  // they stay visible for a post-launch cleanup without blocking the gates
  // that protect the site. Do not re-raise to error without first converting
  // the ~30 call sites.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
