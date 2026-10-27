import { promisify } from 'node:util'
import { finished as _finished } from 'node:stream'

export const finished = promisify(_finished)
