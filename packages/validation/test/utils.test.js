const { describe, it } = require('mocha')
const assert = require('assert')
const utils = require('../lib/utils')
const Issue = require('../lib/issue')

describe('utils.validatePipelineProperty', () => {
  const pipeline = 'pancakes'

  it('should produce an error if first stream is writable, but pipeline is not', () => {
    const pipelineProperties = ['Pipeline', 'Readable']
    const possibleOpProperties = [['Writable'], ['WritableObjectMode'], ['Writable', 'WritableObjectMode']]
    const mode = 'first'
    const issue = Issue.error({
      message: 'Invalid pipeline type for pancakes. The pipeline must be of type Writable or WritableObjectMode'
    })
    const expectedErrors = [[pipeline, issue]]

    for (const opProperties of possibleOpProperties) {
      const actualErrors = []
      utils.validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, actualErrors)
      assert.deepStrictEqual(actualErrors, expectedErrors)
    }
  })
  it('should produce no error if first/last stream is writable or readable', () => {
    const possiblePipelineProperties = [['soft'], ['readable'], ['writable']]
    const possibleOpProperties = [['Writable', 'Readable'], ['WritableObjectMode', 'Readable'], ['Writable', 'ReadableObjectMode'], ['WritableObjectMode', 'ReadableObjectMode']]
    const modes = ['first', 'last']
    const expectedErrors = []

    for (const mode of modes) {
      for (const pipelineProperties of possiblePipelineProperties) {
        for (const opProperties of possibleOpProperties) {
          const actualErrors = []
          utils.validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, actualErrors)
          assert.deepStrictEqual(actualErrors, expectedErrors)
        }
      }
    }
  })
  it('should produce an error if last stream is readable, but pipeline is not', () => {
    const pipelineProperties = ['Pipeline', 'Writable']
    const possibleOpProperties = [['Readable'], ['ReadableObjectMode'], ['Readable', 'ReadableObjectMode']]
    const mode = 'last'
    const issue = Issue.error({
      message: 'Invalid pipeline type for pancakes. The pipeline must be of type Readable or ReadableObjectMode'
    })
    const expectedErrors = [[pipeline, issue]]

    for (const opProperties of possibleOpProperties) {
      const actualErrors = []
      utils.validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, actualErrors)
      assert.deepStrictEqual(actualErrors, expectedErrors)
    }
  })
  it('should produce no error if pipeline type is not defined', () => {
    const pipelineProperties = []
    const opProperties = ['lala', 'lolo']
    const mode = 'first'
    const actualErrors = []
    const expectedErrors = []

    utils.validatePipelineProperty(pipeline, pipelineProperties, opProperties, mode, actualErrors)
    assert.deepStrictEqual(actualErrors, expectedErrors)
  })
})
