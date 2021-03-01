const codelink = require('./codelink')
const dependency = require('./dependency')
const firstOperationIsReadable = require('./firstOperationIsReadable')
const operation = require('./operation')
const operationHasOperationProperty = require('./operationHasOperationProperty')
const operationIsExported = require('./operationIsExported')
const operationIsImportable = require('./operationIsImportable')
const operationPropertiesExist = require('./operationPropertiesExist')
const pipelinePropertiesExist = require('./pipelinePropertiesExist')
const pipelinePropertiesMatchFirstFlex = require('./pipelinePropertiesMatchFirstFlex')
const pipelinePropertiesMatchFirstStrict = require('./pipelinePropertiesMatchFirstStrict')
const pipelinePropertiesMatchLastFlex = require('./pipelinePropertiesMatchLastFlex')
const pipelinePropertiesMatchLastStrict = require('./pipelinePropertiesMatchLastStrict')
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
  operationIsExported,
  operationIsImportable,
  operationPropertiesExist,
  pipelinePropertiesExist,
  pipelinePropertiesMatchFirstFlex,
  pipelinePropertiesMatchFirstStrict,
  pipelinePropertiesMatchLastFlex,
  pipelinePropertiesMatchLastStrict,
  previousOperationHasMetadata,
  readableBeforeWritable,
  readableObjectModeBeforeWritableObjectMode,
  writableAfterReadable,
  writableObjectModeAfterReadableObjectMode
}
