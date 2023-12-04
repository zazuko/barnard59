import path from 'path'
import rdf from 'barnard59-env'
import iriResolve from 'rdf-loader-code/lib/iriResolve.js'
import * as parser from './parser.js'
import { removeFilePart } from './utils.js'
import * as validators from './validators/index.js'

const ns = {
  p: rdf.namespace('https://pipeline.described.at/'),
  code: rdf.namespace('https://code.described.at/'),
}

export default async function validate({ file, checks }) {
  const manifestPath = path.resolve(file)
  const manifestDir = removeFilePart(manifestPath)
  const manifestDirPart = manifestDir.substr(manifestDir.lastIndexOf('/') + 1)

  const manifestGraph = await parser.readGraph(manifestPath, checks)
  const operations = manifestGraph.has(rdf.ns.rdf.type, ns.p.Operation)
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
