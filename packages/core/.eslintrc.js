module.exports = {
  root: true,
  env: {
    node: true,
    "jest/globals": true
  },
  extends: [
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'jest'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-lonely-if': 'error',
    quotes: ['error', 'single', { 'avoidEscape': true }],
    'callback-return': ['error', ['done', 'callback', 'cb', 'send']],
    'object-shorthand': 'error',
    'no-multi-spaces': ['error', { 'ignoreEOLComments': true }],
    'curly': ['error', 'all']
  }
}
