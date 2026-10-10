import { promisify } from 'util'
import { finished as _finished } from 'node:stream'

export const finished = promisify(_finished)
