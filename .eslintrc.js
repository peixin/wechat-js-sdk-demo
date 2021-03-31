module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: ["@typescript-eslint", "prettier"],
  env: {
    node: true,
  },
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
};
