/**
 * @filename: .lintstagedrc.mjs
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{md,json,yaml}": ["prettier --write"],
  "*.{html,css,tsx,jsx}": ["eslint", "prettier --write"]
}