const duplexify = require('duplexify')
const jsonStream = require('JSONStream')
const rdf = require('@rdfjs/data-model')
const { Transform } = require('readable-stream')

function valueToTerm (value, factory) {
  if (value.type === 'uri') {
    return factory.namedNode(value.value)
  }

  if (value.type === 'bnode') {
    return factory.blankNode(value.value)
  }

  if (value.type === 'literal' || value.type === 'typed-literal') {
    return factory.literal(value.value, (value.datatype && factory.namedNode(value.datatype)) || value['xml:lang'])
  }

  return null
}

function bindingResultParser ({ factory }) {
  return new Transform({
    objectMode: true,
    transform (chunk, encoding, callback) {
      this.push(Object.entries(chunk).reduce((row, [key, value]) => {
        row[key] = valueToTerm(value, factory)

        return row
      }, {}))

      callback()
    }
  })
}

function resultParser ({ factory = rdf } = {}) {
  const input = jsonStream.parse('results.bindings.*')
  const output = bindingResultParser({ factory })

  input.pipe(output)

  return duplexify(input, output, { readableObjectMode: true })
}

module.exports = resultParser
