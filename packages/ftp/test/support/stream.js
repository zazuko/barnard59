import { promisify } from 'util'
import { finished as _finished } from 'readable-stream'

export const finished = promisify(_finished)
