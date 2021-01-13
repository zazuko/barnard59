const cf = require('clownface')
const fromFile = require('rdf-utils-fs/fromFile')
const fs = require('fs')
const namespace = require('@rdfjs/namespace')
const path = require('path')
const rdf = require('rdf-ext')
const readline = require('readline')
const iriResolve = require('rdf-loader-code/lib/iriResolve')
const removeFilePart = dirname => path.parse(dirname).dir

const ns = {
  schema: namespace('http://schema.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  p: namespace('https://pipeline.described.at/'),
  code: namespace('https://code.described.at/')
}

const errors = []

async function readGraph (file) {
  const quadStream = fromFile(file)
  const parserPromise = new Promise((resolve, reject) => {
    quadStream.on('error', reject)
    quadStream.on('end', resolve)
  })
  const datasetPromise = rdf.dataset().import(quadStream)

  let dataset, _err
  try {
    [_err, dataset] = await Promise.all([parserPromise, datasetPromise])
  }
  catch (err) {
    const error = await parseError(file, err)
    errors.push(error)
  }

  if (errors.length) {
    const error = errors[0]
    console.error(`${error.message} Line ${error.context.line}: \n${error.context.lineContent}`)
    throw error
  }

  const clownfaceObj = cf({ dataset })

  return clownfaceObj
}

function parseError (path, error) {
  const { line, token: _token } = error.context
  if (typeof line === 'number') {
    const rl = readline.createInterface({
      input: fs.createReadStream(path),
      output: process.stdout,
      terminal: false
    })

    let lineNumber = 0
    rl.on('line', (lineContent) => {
      lineNumber++
      if (lineNumber === line) {
        error.context.lineContent = lineContent
        rl.close()
      }
    })
    return new Promise((resolve) => rl.on('close', () => resolve(error)))
  }
}

function getIdentifiers (graph) {
  const pipeline2identifier = {}

  graph
    .has(ns.rdf.type, ns.p.Pipeline)
    .forEach(pipeline => {
      const steps = pipeline
        .out(ns.p.steps)
        .out(ns.p.stepList)
        .list()

      pipeline2identifier[pipeline.term.value] = []

      for (const step of steps) {
        const identifier = step
          .out(ns.code.implementedBy)
          .out(ns.code.link)
          .term
        pipeline2identifier[pipeline.term.value].push(identifier.value)
      }
    })

  return pipeline2identifier
}

function getModuleOperationProperties (graph, identifiers) {
  const operation2properties = {}

  for (const id of identifiers) {
    operation2properties[id] = []

    graph
      .namedNode(id)
      .in(ns.code.link)
      .in(ns.code.implementedBy)
      .out(ns.rdf.type)
      .forEach(node => {
        const nodeComponents = node.term.value.split('/')
        const property = nodeComponents[nodeComponents.length - 1]

        operation2properties[id].push(property)
      })
  }

  for (const key in operation2properties) {
    if (operation2properties[key].length === 0) {
      operation2properties[key] = null
    }
  }

  return operation2properties
}

function validateDependencies (dependencies) {
  for (const env in dependencies) {
    for (const module in dependencies[env]) {
      const modulePath = removeFilePart(require.resolve(module))

      if (!(fs.existsSync(modulePath))) {
        throw ReferenceError(`Cannot find package ${module}. Did you install it?`)
      }
    }
  }
}

function getAllCodeLinks (pipelines) {
  const codelinks = new Set()
  for (const key in pipelines) {
    pipelines[key].forEach(step => codelinks.add(step))
  }
  return codelinks
}

function getDependencies (codelinks) {
  const dependencies = {}

  codelinks.forEach(codelink => {
    const { protocol, filename } = iriResolve(codelink, process.cwd())

    if (!dependencies[protocol]) {
      dependencies[protocol] = {}
    }
    if (!dependencies[protocol][filename]) {
      dependencies[protocol][filename] = new Set()
    }
    dependencies[protocol][filename].add(codelink)
  })

  return dependencies
}

async function getAllOperationProperties (dependencies) {
  let results = {}
  for (const env in dependencies) {
    for (const module in dependencies[env]) {
      const modulePath = removeFilePart(require.resolve(module))
      const operationsPath = `${modulePath}/operations.ttl`

      if (fs.existsSync(operationsPath)) {
        const graph = await readGraph(operationsPath)
        const tempResults = getModuleOperationProperties(graph, dependencies[env][module].values())
        results = Object.assign({}, results, tempResults)
      }
      else {
        const codelinksWithMissingMetadata = Array.from(dependencies[env][module]).join(', ')
        process.emitWarning(`Operations.ttl file doesn't exist for ${module}. The following steps cannot be validated: ${codelinksWithMissingMetadata}`)

        for (const codelink of dependencies[env][module]) {
          results[codelink] = null
        }
      }
    }
  }
  return results
}

module.exports = {
  readGraph,
  getIdentifiers,
  getAllCodeLinks,
  getDependencies,
  getModuleOperationProperties,
  validateDependencies,
  getAllOperationProperties
}
