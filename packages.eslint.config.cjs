module.exports = [
  {
    files: ["**/*.ts"],
    // This is a framework project, so any is sometimes required to make the cogs turn internally
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];
