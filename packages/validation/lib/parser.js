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

async function readGraph (file, errors = []) {
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
    errors.push(`Cannot parse ${file}:\n  ${error.message} Line ${error.context.line}:\n  ${error.context.lineContent}`)
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

function validateDependencies (dependencies, errors = []) {
  for (const env in dependencies) {
    for (const module in dependencies[env]) {
      const modulePath = removeFilePart(require.resolve(module))

      if (!(fs.existsSync(modulePath))) {
        errors.push(`Missing package ${module}.`)
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

async function getAllOperationProperties (dependencies, errors = []) {
  const results = {}
  for (const env in dependencies) {
    for (const module in dependencies[env]) {
      const modulePath = removeFilePart(require.resolve(module))
      const operationsPath = `${modulePath}/operations.ttl`

      if (fs.existsSync(operationsPath)) {
        const graph = await readGraph(operationsPath, errors)
        const tempResults = getModuleOperationProperties(graph, dependencies[env][module].values())
        Object.assign(results, tempResults)
      }
      else {
        const codelinksWithMissingMetadata = Array.from(dependencies[env][module]).join('"\n  * "')
        errors.push(`Missing metadata file ${operationsPath}\n  The following steps cannot be validated:\n  * "${codelinksWithMissingMetadata}"`)

        for (const codelink of dependencies[env][module]) {
          results[codelink] = null
        }
      }
    }
  }
  return results
}

function validateSteps ({ pipelines, properties }, errors) {
  Object.entries(pipelines).forEach(([pipeline, steps]) => {
    const pipelineErrors = []
    errors.push([pipeline, pipelineErrors])

    steps.reduce((lastStep, step, idx) => {
      const lastStepProperties = properties[lastStep]
      const stepProperties = properties[step]

      if (stepProperties === null) {
        pipelineErrors.push(`Cannot validate step "${step}": no metadata`)
        return step
      }
      if (!stepProperties.includes('Operation')) {
        pipelineErrors.push(`Invalid step "${step}": it is not a ${ns.p.Operation.value}`)
      }
      // first step must be either Readable or ReadableObjectMode
      else if (idx === 0 && !stepProperties.includes('Readable') && !stepProperties.includes('ReadableObjectMode')) {
        pipelineErrors.push(`Invalid step "${step}": it is neither ${ns.p.Readable.value} nor ${ns.p.ReadableObjectMode.value}`)
        return step
      }

      if (lastStep) {
        if (lastStepProperties === null) {
          pipelineErrors.push(`Cannot validate step "${step}": previous step does not have metadata`)
        }
        else {
          // a writable step must always be preceded by a readable step
          if (stepProperties.includes('Writable')) {
            if (!lastStepProperties.includes('Readable')) {
              pipelineErrors.push(`Invalid step "${step}": previous step is not Readable`)
            }
          }
          if (stepProperties.includes('WritableObjectMode')) {
            if (!lastStepProperties.includes('ReadableObjectMode')) {
              pipelineErrors.push(`Invalid step "${step}": previous step is not ReadableObjectMode`)
            }
          }
          // a readable step must always be followed by a writable step
          if (lastStepProperties.includes('Readable')) {
            if (!stepProperties.includes('Writable')) {
              pipelineErrors.push(`Invalid step "${step}": step is not Writable`)
            }
          }
          if (lastStepProperties.includes('WritableObjectMode')) {
            if (!stepProperties.includes('ReadableObjectMode')) {
              pipelineErrors.push(`Invalid step "${step}": step is not WritableObjectMode`)
            }
          }
        }
      }
      return step
    }, '')
  })
}

function printErrors (errors) {
  errors.forEach((error, i) => {
    if (typeof error === 'string') {
      console.error(`${i + 1}. ${error}`)
    }
    else if (Array.isArray(error)) {
      const [pipeline, pipelineErrors] = error
      console.error(`${i + 1}. Errors in pipeline ${pipeline}`)
      pipelineErrors.forEach((error, j) => {
        console.error(`${i + 1}.${j + 1}. ${error}`)
      })
    }
  })
}

module.exports = {
  readGraph,
  getIdentifiers,
  getAllCodeLinks,
  getDependencies,
  validateDependencies,
  getAllOperationProperties,
  printErrors,
  validateSteps
}
