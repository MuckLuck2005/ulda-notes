import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/**", ".husky/**", "dist/**", "coverage/**"]
  },
  js.configs.recommended,
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly"
      }
    },
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "no-console": "warn",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"]
    }
  }
];