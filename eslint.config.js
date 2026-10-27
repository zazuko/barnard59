import path from 'node:path'
import { fileURLToPath } from 'node:url'
import config from '@tpluscode/eslint-config'
import { includeIgnoreFile } from 'eslint/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const gitignorePath = path.resolve(__dirname, '.gitignore')

export default [
  includeIgnoreFile(gitignorePath),
  ...config,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    rules: {
      'import-x/no-unresolved': 'warn',
    },
  },
  {
    files: ['packages/*/test/**'],
    rules: {
      'no-console': 'off',
      'n/no-unpublished-import': 'off',
    },
  },
  {
    ignores: ['.github/**'],
  },
]
