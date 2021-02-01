const cf = require('clownface')
const deepEqual = require('deep-equal')
const formats = require('@rdfjs/formats-common')
const parser = formats.parsers.get('text/turtle')
const rdf = require('rdf-ext')
const { Readable } = require('stream')

module.exports = {
  turtleToCF,
  genericContainsMessage,
  pipelineContainsMessage,
  containsMessage,
  checkArrayContainsField,
  checkArrayContainsObject
}

async function turtleToCF (str) {
  const stream = Readable.from([str])
  const quadStream = parser.import(stream)
  return cf({ dataset: await rdf.dataset().import(quadStream) })
}

function checkArrayContainsField (array, field, value) {
  return Boolean(array.find((element) => element[field] === value))
}

function checkArrayContainsObject (array, obj) {
  return Boolean(array.find((element) => deepEqual(element, obj)))
}

function genericContainsMessage (checksCollection, mssg) {
  return checkArrayContainsField(checksCollection.generic, 'message', mssg)
}

function pipelineContainsMessage (checksCollection, mssg, pipeline) {
  return checkArrayContainsField(checksCollection.pipelines[pipeline], 'message', mssg)
}

function containsMessage (checksCollection, mssg) {
  if (genericContainsMessage(checksCollection, mssg)) {
    return true
  }

  for (const pipeline of Object.keys(checksCollection.pipelines)) {
    if (pipelineContainsMessage(checksCollection, mssg, pipeline)) {
      return true
    }
  }

  return false
}
