import type { NamedNode } from '@rdfjs/types'
import { fromRdf } from 'rdf-literal'
import type { Environment } from 'barnard59-env'
import type { Xsd } from '@tpluscode/rdf-ns-builders/vocabularies/xsd'

const datatypes: Array<keyof Xsd> = [
  'byte',
  'date',
  'dateTime',
  'decimal',
  'double',
  'float',
  'gDay',
  'gMonthDay',
  'gYear',
  'gYearMonth',
  'int',
  'integer',
  'long',
  'negativeInteger',
  'nonNegativeInteger',
  'nonPositiveInteger',
  'positiveInteger',
  'short',
  'unsignedByte',
  'unsignedInt',
  'unsignedLong',
  'unsignedShort',
]

export type DatatypeParser = typeof fromRdf

export default function datatypeParsers(rdf: Environment): Map<NamedNode, DatatypeParser> {
  return rdf.termMap(datatypes.map(datatype => [rdf.ns.xsd[datatype], fromRdf]))
}
