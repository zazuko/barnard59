const { describe, it } = require('mocha')
const assert = require('assert')
const validatePipelineProperty = require('../lib/validatePipelineProperty')
const utils = require('../lib/utils')
const validators = require('../lib/validators')
const ChecksCollection = require('../lib/checksCollection')

describe('validatePipelineProperty', () => {
  const pipeline = 'pancakes'

  it('should produce an error if first stream is writable, but pipeline is not', () => {
    const pipelineProperties = ['Pipeline', 'Readable']
    const possibleOpProperties = [['Writable'], ['WritableObjectMode'], ['Writable', 'WritableObjectMode']]
    const mode = 'first'
    const issue = validators.pipelinePropertiesMatchFirst.validate(pipeline, pipelineProperties)

    for (const opProperties of possibleOpProperties) {
      const checks = new ChecksCollection()
      validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)

      assert(utils.checkArrayContainsObject(checks.pipelines[[pipeline]], issue))
    }
  })
  it('should produce an error if last stream is readable, but pipeline is not', () => {
    const pipelineProperties = ['Pipeline', 'Writable']
    const possibleOpProperties = [['Readable'], ['ReadableObjectMode'], ['Readable', 'ReadableObjectMode']]
    const mode = 'last'
    const issue = validators.pipelinePropertiesMatchLast.validate(pipeline, [])

    for (const opProperties of possibleOpProperties) {
      const checks = new ChecksCollection()
      validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
      assert(utils.checkArrayContainsObject(checks.pipelines[[pipeline]], issue))
    }
  })
  it('should produce an info if first stream is writable, and pipeline is', () => {
    const possiblePipelineProperties = [['Pipeline', 'Writable'], ['Pipeline', 'WritableObjectMode']]
    const possibleOpProperties = [['Writable'], ['WritableObjectMode'], ['Writable', 'WritableObjectMode']]
    const mode = 'first'
    const issue = validators.pipelinePropertiesMatchFirst.validate(pipeline, ['Writable'])

    for (const pipelineProperties of possiblePipelineProperties) {
      for (const opProperties of possibleOpProperties) {
        const checks = new ChecksCollection()
        validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
        assert(utils.checkArrayContainsObject(checks.pipelines[[pipeline]], issue))
      }
    }
  })
  it('should produce an info if last stream is readable, and pipeline is', () => {
    const possiblePipelineProperties = [['Pipeline', 'Readable'], ['Pipeline', 'ReadableObjectMode']]
    const possibleOpProperties = [['Readable'], ['ReadableObjectMode'], ['Readable', 'ReadableObjectMode']]
    const mode = 'last'
    const issue = validators.pipelinePropertiesMatchLast.validate(pipeline, ['ReadableObjectMode'])

    for (const pipelineProperties of possiblePipelineProperties) {
      for (const opProperties of possibleOpProperties) {
        const checks = new ChecksCollection()
        validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, checks)
        console.log(checks.pipelines)
        assert(utils.checkArrayContainsObject(checks.pipelines[[pipeline]], issue))
      }
    }
  })
  it('should produce no info if first stream is writable or readable', () => {
    const possiblePipelineProperties = [['soft'], ['readable'], ['writable']]
    const possibleOpProperties = [['Writable', 'Readable'], ['WritableObjectMode', 'Readable'], ['Writable', 'ReadableObjectMode'], ['WritableObjectMode', 'ReadableObjectMode']]

    for (const pipelineProperties of possiblePipelineProperties) {
      for (const opProperties of possibleOpProperties) {
        const checks = new ChecksCollection()
        validatePipelineProperty(pipeline, pipelineProperties, opProperties, 'first', checks)
        const pipelineHasIssues = pipeline in checks.pipelines
        assert(!pipelineHasIssues)
      }
    }
  })
  it('should produce no info if last stream is writable or readable', () => {
    const possiblePipelineProperties = [['soft'], ['readable'], ['writable']]
    const possibleOpProperties = [['Writable', 'Readable'], ['WritableObjectMode', 'Readable'], ['Writable', 'ReadableObjectMode'], ['WritableObjectMode', 'ReadableObjectMode']]

    for (const pipelineProperties of possiblePipelineProperties) {
      for (const opProperties of possibleOpProperties) {
        const checks = new ChecksCollection()
        validatePipelineProperty(pipeline, pipelineProperties, opProperties, 'last', checks)
        const pipelineHasIssues = pipeline in checks.pipelines
        assert(!pipelineHasIssues)
      }
    }
  })
})
