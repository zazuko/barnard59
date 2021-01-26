const { describe, it } = require('mocha')
const assert = require('assert')
const parser = require('../lib/parser')
const rules = require('../lib/schema')
const ChecksCollection = require('../lib/checksCollection.js')
const Issue = require('../lib/issue')
const utils = require('../lib/utils')

const properties = {
  o: ['Operation'],

  or: ['Operation', 'Readable'],
  orw: ['Operation', 'Readable', 'Writable'],
  ow: ['Operation', 'Writable'],
  rw: ['Readable', 'Writable'],

  oR: ['Operation', 'ReadableObjectMode'],
  oRW: ['Operation', 'ReadableObjectMode', 'WritableObjectMode'],
  oW: ['Operation', 'WritableObjectMode'],
  RW: ['ReadableObjectMode', 'WritableObjectMode'],

  oRw: ['Operation', 'ReadableObjectMode', 'Writable'],
  orW: ['Operation', 'Readable', 'WritableObjectMode'],
  Rw: ['ReadableObjectMode', 'Writable'],
  rW: ['Readable', 'WritableObjectMode'],

  e: [],
  n: null
}

function opToStep (operation) {
  return { stepName: `${operation}-step`, stepOperation: operation }
}

function pipelinesToSteps (pipelines) {
  const pipelinesWithSteps = {}
  Object.entries(pipelines).forEach(([key, value]) => {
    pipelinesWithSteps[key] = value.map(opToStep)
  })
  return pipelinesWithSteps
}

let checks

describe('parser.validateSteps', () => {
  beforeEach(() => {
    checks = new ChecksCollection()
  })

  it('should accept valid pipelines', () => {
    const pipelines = pipelinesToSteps({
      p1: ['or', 'orw', 'ow'],
      p2: ['or', 'orw', 'orw', 'orw', 'orw', 'ow'],
      p3: ['or'],
      p4: ['orw'],
      p5: ['o']
    })

    Object.keys(pipelines).forEach((pipeline) => {
      assert.deepStrictEqual(checks.getPipelineErrors(pipeline), [])
      assert.deepStrictEqual(checks.getPipelineWarnings(pipeline), [])
    })
  })

  it('should accept valid pipelines -- object mode', () => {
    const pipelines = pipelinesToSteps({
      p1: ['oR', 'oRW', 'oW'],
      p2: ['oR', 'oRW', 'oRW', 'oRW', 'oRW', 'oW'],
      p3: ['oR'],
      p4: ['oRW']
    })
    parser.validateSteps({ pipelines, properties }, checks)
    Object.keys(pipelines).forEach((pipeline) => {
      assert.deepStrictEqual(checks.getPipelineErrors(pipeline), [])
      assert.deepStrictEqual(checks.getPipelineWarnings(pipeline), [])
    })
  })

  it('should report missing metadata', () => {
    const pipelines = pipelinesToSteps({
      p1: [
        'n'
      ]
    })
    parser.validateSteps({ pipelines, properties }, checks)

    const expectedMessage = rules.operationPropertiesExist.messageFailure('n')
    const expIssue = Issue.warning({
      step: 'n-step',
      operation: 'n',
      message: expectedMessage
    })

    assert(utils.checkArrayContainsObject(checks.pipelines[['p1']], expIssue))
  })
  it('should report found metadata', () => {
    const pipelines = pipelinesToSteps({
      p1: [
        'rw'
      ]
    })
    parser.validateSteps({ pipelines, properties }, checks)

    const expIssue = Issue.info({
      step: 'rw-step',
      operation: 'rw',
      message: rules.operationPropertiesExist.messageSuccess('rw')
    })
    assert(utils.checkArrayContainsObject(checks.pipelines[['p1']], expIssue))
  })

  it('should report operations missing p:Operation', () => {
    const pipelines = pipelinesToSteps({
      p1: [
        'e'
      ]
    })
    parser.validateSteps({ pipelines, properties }, checks)

    const expIssue = Issue.error({
      step: 'e-step',
      operation: 'e',
      message: rules.operationHasOperationProperty.messageFailure('e')
    })
    assert(utils.checkArrayContainsObject(checks.pipelines[['p1']], expIssue))
  })

  it('should report non-writable operation being written into', () => {
    const pipelines = pipelinesToSteps({
      p1: [
        'or',
        'orw',
        'or'
      ]
    })
    parser.validateSteps({ pipelines, properties }, checks)

    const expIssue = Issue.error({
      step: 'or-step',
      operation: 'or',
      message: rules.writableAfterReadable.messageFailure('or')
    })

    assert(utils.checkArrayContainsObject(checks.pipelines[['p1']], expIssue))
  })

  it('should report error if first operation is writable', () => {
    const pipelines = pipelinesToSteps({
      p1: [
        'ow',
        'orw'
      ]
    })
    parser.validateSteps({ pipelines, properties }, checks)

    const expIssue = Issue.error({
      step: 'ow-step',
      operation: 'ow',
      message: rules.firstOperationIsReadable.messageFailure('ow')
    })

    assert(utils.checkArrayContainsObject(checks.pipelines[['p1']], expIssue))
  })
  it('should report bad mix of normal streams and object-mode streams', () => {
    const pipelines = pipelinesToSteps({
      p1: [
        'or',
        'orW'
      ],
      p2: [
        'oR',
        'orw'
      ],
      p3: [
        'oR',
        'oRw'
      ],
      p4: [
        'or',
        'orw',
        'orW'
      ]
    })
    parser.validateSteps({ pipelines, properties }, checks)

    const expectedErrors = {
      p1: ['orW', rules.readableObjectModeBeforeWritableObjectMode.messageFailure('orW')],
      p2: ['orw', rules.readableBeforeWritable.messageFailure('orw')],
      p3: ['oRw', rules.readableBeforeWritable.messageFailure('oRw')],
      p4: ['orW', rules.readableObjectModeBeforeWritableObjectMode.messageFailure('orW')]
    }

    Object.keys(pipelines).forEach((pipeline) => {
      const [erroredOp, errorMessage] = expectedErrors[pipeline]
      checks.pipelineContainsMessage(errorMessage, pipeline)
    })
  })
})
