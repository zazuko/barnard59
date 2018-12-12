const ns = require('./namespaces')
const once = require('lodash/once')
const Readable = require('readable-stream').Readable

class Pipeline extends Readable {
  constructor (node, { basePath = process.cwd(), context = {}, objectMode, variables = new Map(), loaderRegistry } = {}) {
    super({ objectMode })

    this.node = node
    this.basePath = basePath
    this.variables = new Map([...this.parseVariables(), ...variables])

    this.context = context
    this.context.basePath = this.basePath
    this.context.pipeline = this
    this.context.variables = this.variables
    this.loaderRegistry = loaderRegistry

    this.init = once(() => this._init().catch(err => this.emit('error', err)))
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

  _init () {
    return this.initSteps().then(() => {
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
    })
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
    const operation = await this.parseOperation(step.out(ns.p('operation')))

    const args = step.out(ns.p('arguments'))

    const argsArray = (args.term ? [...args.list()] : []).map(arg => this.parseArgument(arg))

    return Promise.all(argsArray).then(resolved => {
      return operation.apply(this.context, resolved)
    })
  }

  parseVariables () {
    const variableNodes = this.node.out(ns.p('variables')).out(ns.p('variable'))

    return variableNodes.toArray().reduce((variables, variable) => {
      return variables.set(variable.out(ns.p('name')).value, variable.out(ns.p('value')).value)
    }, new Map())
  }
}

module.exports = Pipeline
