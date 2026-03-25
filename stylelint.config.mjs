/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["node_modules/**", ".husky/**", "dist/**", "coverage/**"],
  rules: {
    "selector-class-pattern": "^[a-z][a-z0-9\\-]*$",
    "color-hex-length": "short"
  }
};