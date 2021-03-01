const path = require('path')
const parser = require('./parser')
const namespace = require('@rdfjs/namespace')
const { removeFilePart } = require('./utils')
const iriResolve = require('rdf-loader-code/lib/iriResolve')
const validators = require('./validators')

const ns = {
  schema: namespace('http://schema.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  p: namespace('https://pipeline.described.at/'),
  code: namespace('https://code.described.at/')
}

async function validate ({ file, checks }) {
  const manifestPath = path.resolve(file)
  const manifestDir = removeFilePart(manifestPath)
  const manifestDirPart = manifestDir.substr(manifestDir.lastIndexOf('/') + 1)

  const manifestGraph = await parser.readGraph(manifestPath, checks)
  const operations = manifestGraph.has(ns.rdf.type, ns.p.Operation)
    .map(operation => {
      const implementedBy = operation.out(ns.code.implementedBy)
      const codeLink = implementedBy.out(ns.code.link)
      const identifier = codeLink.term

      const { filename, method } = iriResolve(identifier.value)
      return { operation: operation.term.value, filename, method }
    })
    .map(({ operation, filename, method }) => {
      filename = manifestDir + filename.replace(manifestDirPart, '')
      method = method || 'default'
      return { operation, filename, method }
    })

  await operations.reduce(async (promise, { operation: op, filename, method }) => {
    await promise
    const fileIssue = await validators.operationIsImportable.validate({ op, filename })
    checks.addGenericCheck(fileIssue)
    if (fileIssue.level !== 'error') {
      checks.addGenericCheck(await validators.operationIsExported.validate({ op, filename, method }))
    }
  }, Promise.resolve())
}

module.exports = validate
