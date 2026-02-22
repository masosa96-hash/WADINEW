import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
// import { createRequire } from "module";

// const require = createRequire(import.meta.url);
// const prettierRecommended = require("eslint-plugin-prettier/recommended");
// const boundaries = require("eslint-plugin-boundaries");

// Standard flat config with Prettier recommended usually handles things better
export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.git/**",
      "**/coverage/**",
      "**/.firebase/**",
      "**/.turbo/**",
      "scripts/**",
      "apps/tests/**",
      "eslint.config.js",
      "*.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // prettierRecommended,
  {
    // plugins: {
    //   boundaries,
    // },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      "boundaries/elements": [
        {
          type: "app",
          pattern: "apps/*",
        },
        {
          type: "package",
          pattern: "packages/*",
        },
      ],
      "boundaries/ignore": ["**/*.test.ts", "**/*.spec.ts"],
    },
    rules: {
      "no-unused-vars": "off", // Handled by typescript-eslint
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }], // Discourage plain console.log
      "@typescript-eslint/no-explicit-any": "error", // Strict mode
      eqeqeq: "error", // Enforce type-safe equality
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  {
    files: ["apps/frontend/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    files: [
      "apps/api/**/*.js",
      "apps/kivo-brain-api/**/*.js",
      "packages/**/*.js",
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-undef": "off",
    },
  },
  {
    files: ["apps/kivo/www/**/*.js", "apps/kivo/android/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        firebase: "readonly",
        db: "writable",
        module: "readonly",
      },
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "off",
    },
  },
  {
    files: ["apps/kivo/tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-undef": "off",
    },
  }
);
