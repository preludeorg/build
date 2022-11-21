module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["unicorn"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.eslint.json",
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-floating-promises": "error",
    "prettier/prettier": ["error", { endOfLine: "auto" }],
  },
};
