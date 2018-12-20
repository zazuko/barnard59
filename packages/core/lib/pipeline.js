const ns = require('./namespaces')
const once = require('lodash/once')
const Readable = require('readable-stream').Readable

class Pipeline extends Readable {
  constructor (node, { basePath = process.cwd(), context = {}, objectMode, variables = new Map(), loaderRegistry } = {}) {
    super({ objectMode })

    this.node = node
    this.basePath = basePath
    this.variables = variables

    this.context = context
    this.context.basePath = this.basePath
    this.context.pipeline = this
    this.loaderRegistry = loaderRegistry

    this.init = once(() => this._init().catch(err => this.emit('error', err)))
    this.initVariables = once(async () => {
      const parsedVariables = await this.parseVariables()
      this.variables = new Map([...parsedVariables, ...this.variables])
      this.context.variables = this.variables
    })
  }

  clone ({ basePath, context, objectMode, variables }) {
    return new Pipeline(this.node, {
      basePath: basePath || this.basePath,
      context: context || this.context,
      variables: variables || this.variables,
      loaderRegistry: this.loaderRegistry,
      objectMode: objectMode || this.objectMode
    })
  }

  _read () {
    this.init()
  }

  async _init () {
    await this.initVariables()

    await this.initSteps()

    for (let index = 0; index < this.streams.length - 1; index++) {
      this.streams[index].pipe(this.streams[index + 1])
    }

    this.streams.forEach((stream, index) => {
      const step = this.steps[index]

      stream.on('error', cause => {
        const err = new Error(`error in pipeline step ${step.value}`)

        err.stack += `\nCaused by: ${cause.stack}`

        this.emit('error', err)
      })
    })

    const lastStream = this.streams[this.streams.length - 1]

    lastStream.on('data', chunk => this.push(chunk))
    lastStream.on('end', () => this.push(null))

    return this
  }

  initSteps () {
    this.steps = [...this.node.out(ns.p('steps')).out(ns.p('stepList')).list()]

    return Promise.all(this.steps.map(step => this.parseStep(step))).then(streams => {
      this.streams = streams
    })
  }

  async parseArgument (arg) {
    const code = await this.loaderRegistry.load(arg, this.context, this.variables, this.basePath)

    if (code) {
      return code
    }

    if (arg.term.termType === 'Literal') {
      return arg.value
    }

    return arg
  }

  async parseOperation (operation) {
    let result = await this.loaderRegistry.load(operation, this.context, this.variables, this.basePath)

    if (!result) {
      throw new Error(`Failed to load operation ${operation.value}`)
    }

    return result
  }

  async parseStep (step) {
    const operation = await this.parseOperation(step.out(ns.code('implementedBy')))

    const args = step.out(ns.code('arguments'))

    const argsArray = (args.term ? [...args.list()] : []).map(arg => this.parseArgument(arg))

    return Promise.all(argsArray).then(resolved => {
      return operation.apply(this.context, resolved)
    })
  }

  parseVariables () {
    const variableNodes = this.node.out(ns.p('variables')).out(ns.p('variable'))

    return variableNodes.toArray().reduce(async (p, variableNode) => {
      const variables = await p
      const variable = await this.loaderRegistry.load(variableNode, this.context, new Map())
      if (!variable) {
        throw new Error(`Failed to load variable ${variableNode}`)
      }

      variables.push([ variable.name, variable.value ])
      return variables
    }, Promise.resolve([]))
  }
}

module.exports = Pipeline
