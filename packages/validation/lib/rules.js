import { fileURLToPath } from 'url'
import process from 'process'
import * as validators from './validators/index.js'
import { log } from './log.js'

export const rules = Object.values(validators)
  .map((validator) => validator.describeRule())
  .sort(({ ruleId: a }, { ruleId: b }) => a - b)

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  log(JSON.stringify(rules, null, 2))
}
