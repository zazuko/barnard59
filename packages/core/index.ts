import type { Logger } from 'winston'
import type { Environment } from 'barnard59-env'
import type { GraphPointer, AnyPointer } from 'clownface'
import defaultLoaderRegistry from './lib/defaultLoaderRegistry.js'
import defaultLogger from './lib/defaultLogger.js'
import createPipeline from './lib/factory/pipeline.js'
import run from './lib/run.js'
import type { PipelineOptions } from './lib/Pipeline.js'
import type Pipeline from './lib/Pipeline.js'

export type { default as Step } from './lib/Step.js'
export type { default as Pipeline, PipelineOptions } from './lib/Pipeline.js'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Variables {}

type Keys = keyof Variables extends never ? string : keyof Variables;

interface TypedMap extends Map<Keys, unknown> {
  get<K extends keyof Variables>(key: K): Variables[typeof key]
  set<K extends keyof Variables>(key: K, value: Variables[typeof key] | undefined): this
}

export type VariableMap = (keyof Variables extends never ? Map<string, unknown> : TypedMap)

export interface Context {
  graph: AnyPointer
  env: Environment
  logger: Logger
  variables: VariableMap
  basePath: string
  createPipeline(ptr: GraphPointer, arg?: Partial<PipelineOptions>): Pipeline
  error(err: Error): void
}

export {
  createPipeline,
  defaultLoaderRegistry,
  defaultLogger,
  run,
}
