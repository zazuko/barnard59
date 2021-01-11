module.exports = {
  root: true,
  env: {
    mocha: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  globals: {
    fetch: true
  },
  extends: [
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  plugins: [],
  settings: {},
  rules: {
    'no-lonely-if': 'error',
    quotes: ['error', 'single', { avoidEscape: true }],
    'object-shorthand': 'error',
    'no-multi-spaces': ['error', { ignoreEOLComments: true }],
    'brace-style': ['error', 'stroustrup', { allowSingleLine: false }],
    curly: ['error', 'all'],
    'template-curly-spacing': 'off',
    indent: ['error', 2],
    semi: ['error', 'never'],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_|next', varsIgnorePattern: '^_|next' }]
  }
}
