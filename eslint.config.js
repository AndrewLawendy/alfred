import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // The Cloud Function is plain Node, outside the app's TypeScript project
  { ignores: ["build", "functions", "node_modules"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      // Rules that use TypeScript's types: unhandled promises, awaiting
      // non-promises, methods passed without their object
      tseslint.configs.recommendedTypeChecked,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      // The React team's rules, including the React Compiler checks
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
      // Formatting is Prettier's job
      prettier,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { react: { version: "detect" } },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/prefer-includes": "warn",
      "@typescript-eslint/prefer-string-starts-ends-with": "error",
      "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],
      // Leaving a prop out of a ...rest spread is the point, not a leftover
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
      // Async click handlers are fine in JSX; each one catches its own errors
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      // Types already describe the props
      "react/prop-types": "off",
    },
  }
);
