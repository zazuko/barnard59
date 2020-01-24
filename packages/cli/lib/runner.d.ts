import { DatasetCore } from 'rdf-js'
import { Writable } from 'stream'

declare type Runner = {
    (dataset: DatasetCore): Promise<any>
}

declare interface RunnerInit {
    basePath: string
    outputStream: Writable
    pipeline?: string
    variable?: Map<string, string>
    verbose?: boolean
    log?: (message: string) => void
}

declare function create (options: RunnerInit): Runner

export = create
