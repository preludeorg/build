module.exports = {
  root: true,
  extends: ["custom"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json", "./tsconfig.vite.json"],
  },
  ignorePatterns: ["node_modules", "dist"],
};
