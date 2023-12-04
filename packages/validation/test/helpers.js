import { Readable } from 'stream'
import deepEqual from 'deep-equal'
import rdf from 'barnard59-env'

const parser = rdf.formats.parsers.get('text/turtle')

export async function turtleToCF(str) {
  const stream = Readable.from([str])
  const quadStream = parser.import(stream)
  return rdf.clownface({ dataset: await rdf.dataset().import(quadStream) })
}

export function checkArrayContainsField(array, field, value) {
  return Boolean(array.find((element) => element[field] === value))
}

export function checkArrayContainsObject(array, obj) {
  return Boolean(array.find((element) => deepEqual(element, obj)))
}

export function genericContainsMessage(checksCollection, mssg) {
  return checkArrayContainsField(checksCollection.generic, 'message', mssg)
}

export function pipelineContainsMessage(checksCollection, mssg, pipeline) {
  return checkArrayContainsField(checksCollection.pipelines[pipeline], 'message', mssg)
}

export function containsMessage(checksCollection, mssg) {
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
