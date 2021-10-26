import * as fs from 'fs'
import fetch from '@rdfjs/fetch'
import ParserN3 from '@rdfjs/parser-n3'
import rdf from 'rdf-ext'
import SHACLValidator from 'rdf-validate-shacl'
import { Transform } from 'readable-stream'

class ValidateChunk extends Transform {
  constructor (shape) {
    super({
      writableObjectMode: true,
      readableObjectMode: true
    })
    this.validator = new SHACLValidator(shape, { maxErrors: 1 })
  }

  _transform (chunk, encoding, callback) {
    const report = this.validator.validate(chunk)
    if (!report.conforms) {
      const errorMessage = buildErrorMessage(report)
      this.destroy(new Error(errorMessage))
    } else {
      callback(null, chunk)
    }
  }
}

async function validate ({ shacl: url, shaclStream }) {
  if (!(url || shaclStream)) {
    throw new Error('needs a shacl or shaclStream argument')
  }
  if (url && shaclStream) {
    throw new Error('shacl and shaclStream given, but only one argument allowed')
  }

  async function readFromURL (fileOrLink) {
    const url = new URL(fileOrLink, import.meta.url)

    if (!(url.protocol === 'https:' || url.protocol === 'http:' || url.protocol === 'file:')) {
      throw new Error(`${url} not supported`)
    }

    if (url.protocol === 'file:') {
      const parser = new ParserN3({ factory: rdf })
      return rdf.dataset().import(parser.import(fs.createReadStream(url)))
    } else {
      const res = await fetch(url)
      return res.dataset()
    }
  }

  const shape = url ? await readFromURL(url) : await shaclStream
  return new ValidateChunk(shape)
}

function buildErrorMessage (report) {
  return JSON.stringify(report.results.map(x => {
    const result = {}
    if (x.message && x.message.length > 0) {
      result.message = x.message.map(x => x.value)
    }
    if (x.path) {
      result.path = x.path.value
    }
    if (x.sourceShape) {
      result.sourceShape = x.sourceShape.value
    }
    // Mandatory
    result.focusNode = x.focusNode.value
    result.severity = x.severity.value
    result.sourceConstraintComponent = x.sourceConstraintComponent.value
    return result
  }))// TODO define an error format
}

export default validate
