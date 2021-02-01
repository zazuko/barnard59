const codelink = require('./codelink')
const dependency = require('./dependency')
const firstOperationIsReadable = require('./firstOperationIsReadable')
const operation = require('./operation')
const operationHasOperationProperty = require('./operationHasOperationProperty')
const operationPropertiesExist = require('./operationPropertiesExist')
const pipelinePropertiesExist = require('./pipelinePropertiesExist')
const pipelinePropertiesMatchFirst = require('./pipelinePropertiesMatchFirst')
const pipelinePropertiesMatchLast = require('./pipelinePropertiesMatchLast')
const previousOperationHasMetadata = require('./previousOperationHasMetadata')
const readableBeforeWritable = require('./readableBeforeWritable')
const readableObjectModeBeforeWritableObjectMode = require('./readableObjectModeBeforeWritableObjectMode')
const writableAfterReadable = require('./writableAfterReadable')
const writableObjectModeAfterReadableObjectMode = require('./writableObjectModeAfterReadableObjectMode')

module.exports = {
  codelink,
  dependency,
  firstOperationIsReadable,
  operation,
  operationHasOperationProperty,
  operationPropertiesExist,
  pipelinePropertiesExist,
  pipelinePropertiesMatchFirst,
  pipelinePropertiesMatchLast,
  previousOperationHasMetadata,
  readableBeforeWritable,
  readableObjectModeBeforeWritableObjectMode,
  writableAfterReadable,
  writableObjectModeAfterReadableObjectMode
}
