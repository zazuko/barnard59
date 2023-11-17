import { fromRdf } from 'rdf-literal'

const datatypes = [
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

export default function datatypeParsers(rdf) {
  return rdf.termMap(datatypes.map(datatype => [rdf.ns.xsd[datatype], fromRdf]))
}
