const clownface = require('clownface')
const parseCode = require('./code').parse
const ns = require('./namespaces')
const once = require('lodash/once')
const rdf = require('rdf-ext')
const Readable = require('readable-stream').Readable

class Pipeline extends Readable {
  constructor (node, { basePath = process.cwd(), context = {}, variables = new Map() } = {}) {
    super()

    this.node = node
    this.basePath = basePath
    this.variables = new Map([...this.parseVariables(), ...variables])

    this.context = context
    this.context.basePath = this.basePath
    this.context.variables = this.variables

    this.init = once(() => this._init().catch(err => this.emit('error', err)))
  }

  _read () {
    this.init()
  }

  _init () {
    return this.initSteps().then(streams => {
      for (let index = 0; index < streams.length - 1; index++) {
        streams[index].pipe(streams[index + 1])
      }

      streams.forEach((stream, index) => {
        const step = this.steps[index]

        stream.on('error', cause => {
          const err = new Error(`error in pipeline step ${step.value}`)

          err.cause = cause

          this.emit('error', err)
        })
      })

      const lastStream = streams[streams.length - 1]

      lastStream.on('data', chunk => this.push(chunk))
      lastStream.on('end', () => this.push(null))
      lastStream.on('error', err => this.emit('error', err))

      return this
    })
  }

  initSteps () {
    this.steps = [...this.node.out(ns.p('steps')).out(ns.p('stepList')).list()]

    return Promise.all(this.steps.map(step => this.parseStep(step)))
  }

  parseArgument (arg) {
    const code = parseCode(arg, this.context, this.variables, this.basePath)

    if (code) {
      return code
    }

    if (arg.term.termType === 'Literal') {
      return arg.value
    }

    return arg
  }

  parseOperation (operation) {
    return parseCode(operation, this.context, this.variables, this.basePath)
  }

  parseStep (step) {
    const operation = this.parseOperation(step.out(ns.p('operation')))

    const args = step.out(ns.p('arguments'))

    const argsArray = (args.term ? [...args.list()] : []).map(arg => this.parseArgument(arg))

    return Promise.resolve().then(() => {
      return operation.apply(this.context, argsArray)
    })
  }

  parseVariables () {
    const variableNodes = this.node.out(ns.p('variables')).out(ns.p('variable'))

    return variableNodes.toArray().reduce((variables, variable) => {
      return variables.set(variable.out(ns.p('name')).value, variable.out(ns.p('value')).value)
    }, new Map())
  }

  static pipelineNode (definition, iri) {
    let node

    if (iri) {
      node = clownface.dataset(definition, rdf.namedNode(iri.toString()))
    } else {
      node = clownface.dataset(definition).has(ns.rdf('type'), ns.p('Pipeline'))
    }

    if (!node.term) {
      throw new Error('expected an existing IRI or a single Pipeline class in definition')
    }

    return node
  }

  static create (definition, { iri, basePath, context, variables } = {}) {
    return new Pipeline(Pipeline.pipelineNode(definition, iri), { basePath, context, variables })
  }
}

module.exports = Pipeline.create
