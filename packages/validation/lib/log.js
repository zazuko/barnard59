import { Console } from 'node:console'
import process from 'node:process'

export const log = new Console(process.stdout, process.stderr)
