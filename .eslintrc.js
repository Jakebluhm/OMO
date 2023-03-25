module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  overrides: [],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
  },
  plugins: ["react"],
  rules: {},
};
