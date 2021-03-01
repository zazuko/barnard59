import { finished as _finished } from 'readable-stream'
import { promisify } from 'util'

export const finished = promisify(_finished)
