import { DatasetCore } from 'rdf-js'
import { Writable } from 'stream'
import { Debugger } from 'debug'

declare type Runner = {
    (dataset: DatasetCore): Promise<any>
}

declare interface RunnerInit {
    basePath: string
    outputStream: Writable
    pipeline: string
    variable?: Map<string, string>
}

declare function create (options: RunnerInit): Runner
declare const log: Debugger;

export {
    create,
    log,
}
