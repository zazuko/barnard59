const { describe, it } = require('mocha')
const assert = require('assert')
const validatePipelineProperty = require('../lib/validatePipelineProperty')
const validators = require('../lib/validators')
const ChecksCollection = require('../lib/checksCollection')
const { checkArrayContainsObject } = require('./helpers')
let checks

describe('validatePipelinePropertyModeFirst', () => {
  beforeEach(() => {
    checks = new ChecksCollection()
  })
  const pipeline = 'pancakes'
  const mode = 'first'

  it('should produce an error if first stream is writable, but pipeline is not', () => {
    const pipelineProperties = ['Pipeline', 'WritableObjectMode']
    const opProperties = ['Writable']
    const issue = validators.pipelinePropertiesMatchFirstStrict.validate(pipeline, pipelineProperties, 'Writable')

    validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
    assert(checkArrayContainsObject(checks.pipelines[pipeline], issue))
  })
  it('should produce an error if first stream is WritableObjectMode, but pipeline is not', () => {
    const pipelineProperties = ['Pipeline', 'Writable']
    const opProperties = ['WritableObjectMode']
    const issue = validators.pipelinePropertiesMatchFirstStrict.validate(pipeline, pipelineProperties, 'WritableObjectMode')

    validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
    assert(checkArrayContainsObject(checks.pipelines[pipeline], issue))
  })
  it('should produce an error if first stream is Writable or WritableObjectMode, but pipeline is not', () => {
    const pipelineProperties = ['Pipeline', 'Readable']
    const opProperties = ['Writable', 'WritableObjectMode']
    const issue = validators.pipelinePropertiesMatchFirstFlex.validate(pipeline, pipelineProperties)

    validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
    assert(checkArrayContainsObject(checks.pipelines[pipeline], issue))
  })
  it('should produce an info if first stream is writable and pipeline is', () => {
    const pipelineProperties = ['Pipeline', 'Writable']
    const opProperties = ['Writable']
    const issue = validators.pipelinePropertiesMatchFirstStrict.validate(pipeline, pipelineProperties, 'Writable')

    validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
    assert(checkArrayContainsObject(checks.pipelines[pipeline], issue))
  })
  it('should produce an info if first stream is WritableObjectMode and pipeline is', () => {
    const pipelineProperties = ['Pipeline', 'WritableObjectMode']
    const opProperties = ['WritableObjectMode']
    const issue = validators.pipelinePropertiesMatchFirstStrict.validate(pipeline, pipelineProperties, 'WritableObjectMode')

    validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
    assert(checkArrayContainsObject(checks.pipelines[pipeline], issue))
  })
  it('should produce an info if first stream is Writable or WritableObjectMode and pipeline is', () => {
    const possiblePipelineProperties = [['Pipeline', 'Writable'], ['Pipeline', 'WritableObjectMode']]
    const opProperties = ['Writable', 'WritableObjectMode']

    for (const pipelineProperties of possiblePipelineProperties) {
      const issue = validators.pipelinePropertiesMatchFirstFlex.validate(pipeline, pipelineProperties)
      validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
      assert(checkArrayContainsObject(checks.pipelines[pipeline], issue))
    }
  })
  it('should produce no info if first stream is writable or readable', () => {
    const possiblePipelineProperties = [['soft'], ['readable'], ['writable']]
    const possibleOpProperties = [['Writable', 'Readable'], ['WritableObjectMode', 'Readable'], ['Writable', 'ReadableObjectMode'], ['WritableObjectMode', 'ReadableObjectMode']]

    for (const pipelineProperties of possiblePipelineProperties) {
      for (const opProperties of possibleOpProperties) {
        validatePipelineProperty(pipeline, pipelineProperties, opProperties, 'first', checks)
        const pipelineHasIssues = pipeline in checks.pipelines
        assert(!pipelineHasIssues)
      }
    }
  })
})

describe('validatePipelinePropertyModeLast', () => {
  beforeEach(() => {
    checks = new ChecksCollection()
  })
  const pipeline = 'pancakes'
  const mode = 'last'

  it('should produce an error if last stream is readable, but pipeline is not', () => {
    const pipelineProperties = ['Pipeline', 'Writable']
    const opProperties = ['Readable']

    const issue = validators.pipelinePropertiesMatchLastStrict.validate(pipeline, pipelineProperties, 'Readable')

    validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
    assert(checkArrayContainsObject(checks.pipelines[pipeline], issue))
  })
  it('should produce an error if last stream is ReadableObjectMode, but pipeline is not', () => {
    const pipelineProperties = ['Pipeline', 'Writable']
    const opProperties = ['ReadableObjectMode']

    const issue = validators.pipelinePropertiesMatchLastStrict.validate(pipeline, pipelineProperties, 'ReadableObjectMode')

    validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
    assert(checkArrayContainsObject(checks.pipelines[pipeline], issue))
  })
  it('should produce an error if last stream is readable or ReadableObjectMode, but pipeline is not', () => {
    const pipelineProperties = ['Pipeline', 'Writable']
    const opProperties = ['Readable', 'ReadableObjectMode']

    const issue = validators.pipelinePropertiesMatchLastFlex.validate(pipeline, pipelineProperties)

    validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
    assert(checkArrayContainsObject(checks.pipelines[pipeline], issue))
  })

  it('should produce an info if last stream is readable, and pipeline is', () => {
    const pipelineProperties = ['Pipeline', 'Readable']
    const opProperties = ['Readable']

    const issue = validators.pipelinePropertiesMatchLastStrict.validate(pipeline, pipelineProperties, 'Readable')

    validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
    assert(checkArrayContainsObject(checks.pipelines[pipeline], issue))
  })
  it('should produce an info if last stream is ReadableObjectMode, and pipeline is', () => {
    const pipelineProperties = ['Pipeline', 'ReadableObjectMode']
    const opProperties = ['ReadableObjectMode']

    const issue = validators.pipelinePropertiesMatchLastStrict.validate(pipeline, pipelineProperties, 'ReadableObjectMode')

    validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
    assert(checkArrayContainsObject(checks.pipelines[pipeline], issue))
  })
  it('should produce an info if last stream is Readable or ReadableObjectMode, and pipeline is', () => {
    const possiblePipelineProperties = [['Pipeline', 'Readable'], ['Pipeline', 'ReadableObjectMode']]
    const opProperties = ['Readable', 'ReadableObjectMode']

    for (const pipelineProperties of possiblePipelineProperties) {
      const issue = validators.pipelinePropertiesMatchLastFlex.validate(pipeline, pipelineProperties)
      validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
      assert(checkArrayContainsObject(checks.pipelines[pipeline], issue))
    }
  })
  it('should produce no info if last stream is writable or readable', () => {
    const possiblePipelineProperties = [['soft'], ['readable'], ['writable']]
    const possibleOpProperties = [['Writable', 'Readable'], ['WritableObjectMode', 'Readable'], ['Writable', 'ReadableObjectMode'], ['WritableObjectMode', 'ReadableObjectMode']]

    for (const pipelineProperties of possiblePipelineProperties) {
      for (const opProperties of possibleOpProperties) {
        validatePipelineProperty(pipeline, pipelineProperties, opProperties, 'last', checks)
        const pipelineHasIssues = pipeline in checks.pipelines
        assert(!pipelineHasIssues)
      }
    }
  })
})
