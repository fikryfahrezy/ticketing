/**
 * @filename: .lintstagedrc.mjs
 * @type {import('lint-staged').Configuration}
 */
const config = {
  "*.{md,json,yaml}": ["prettier --write"],
  "*.{html,css,tsx,jsx}": ["eslint", "prettier --write"]
};

export default config;