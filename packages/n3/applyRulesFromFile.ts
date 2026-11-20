import { readFileSync } from 'fs'
import { resolve } from 'path'
import untildify from 'untildify'
import applyRules from './applyRules.js'

export default function ({ rulesPath, includeInput }: { rulesPath: string, includeInput?: boolean }) {
  const rulesText = readFileSync(resolve(untildify(rulesPath)), 'utf8')
  return applyRules({ rulesText, includeInput })
}
