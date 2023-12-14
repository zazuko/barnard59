import { Stream } from 'readable-stream'
import { LoaderRegistry } from 'rdf-loaders-registry'
import { Logger } from 'winston'
import type { GraphPointer } from 'clownface'
import * as otel from '@opentelemetry/api'
import { Context, VariableMap } from '../index.js'
import { VariableMap as VariableMapImpl } from './VariableMap.js'

export interface Options {
  basePath: string
  // eslint-disable-next-line no-use-before-define
  children?: StreamObject[]
  context?: Partial<Context>
  loaderRegistry: LoaderRegistry
  logger: Logger
  ptr: GraphPointer
  variables?: VariableMap
}

abstract class StreamObject<S extends Stream = Stream> {
  public basePath: string
  // eslint-disable-next-line no-use-before-define
  public readonly children: StreamObject[]
  public context: Context
  public readonly loaderRegistry: LoaderRegistry
  public variables: VariableMap
  public readonly logger: Logger
  public readonly ptr: GraphPointer
  protected _span!: otel.Span

  protected constructor({
    basePath,
    children = [],
    context = {},
    loaderRegistry,
    logger,
    ptr,
    variables = new VariableMapImpl(),
  }: Options) {
    this.basePath = basePath
    this.children = children
    this.context = context as unknown as Context
    this.loaderRegistry = loaderRegistry
    this.logger = logger
    this.ptr = ptr
    this.variables = variables

    this.logger.trace({ iri: this.ptr.value, message: 'created new StreamObject' })
  }

  public abstract get stream(): S
}

export default StreamObject
