import assert from 'node:assert'
import * as parser from '../lib/parser.js'
import ChecksCollection from '../lib/checksCollection.js'
import * as validators from '../lib/validators/index.js'
import { pipelineContainsMessage, checkArrayContainsObject } from './helpers.js'

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
  n: null,
}

function opToStep(operation) {
  return { stepName: `${operation}-step`, stepOperation: operation }
}

function pipelinesToSteps(pipelines) {
  const pipelinesWithSteps = {}
  Object.entries(pipelines).forEach(([key, value]) => {
    pipelinesWithSteps[key] = value.map(opToStep)
  })
  return pipelinesWithSteps
}

let checks

describe('parser.validateSteps', function () {
  beforeEach(function () {
    checks = new ChecksCollection()
  })

  it('should accept valid pipelines', function () {
    const pipelines = pipelinesToSteps({
      p1: ['or', 'orw', 'ow'],
      p2: ['or', 'orw', 'orw', 'orw', 'orw', 'ow'],
      p3: ['or'],
      p4: ['orw'],
      p5: ['o'],
    })

    Object.keys(pipelines).forEach((pipeline) => {
      assert.deepStrictEqual(checks.getPipelineChecks(pipeline, 'error'), [])
      assert.deepStrictEqual(checks.getPipelineChecks(pipeline, 'warning'), [])
    })
  })

  it('should accept valid pipelines -- object mode', function () {
    const pipelines = pipelinesToSteps({
      p1: ['oR', 'oRW', 'oW'],
      p2: ['oR', 'oRW', 'oRW', 'oRW', 'oRW', 'oW'],
      p3: ['oR'],
      p4: ['oRW'],
    })
    parser.validateSteps({ pipelines, properties }, checks)
    Object.keys(pipelines).forEach((pipeline) => {
      assert.deepStrictEqual(checks.getPipelineChecks(pipeline, 'error'), [])
      assert.deepStrictEqual(checks.getPipelineChecks(pipeline, 'warning'), [])
    })
  })

  it('should report missing metadata', function () {
    const pipelines = pipelinesToSteps({
      p1: [
        'n',
      ],
    })

    parser.validateSteps({ pipelines, properties }, checks)
    const expIssue = validators.operationPropertiesExist.validate(null, 'n-step', 'n')
    assert(checkArrayContainsObject(checks.pipelines.p1, expIssue))
  })

  it('should report found metadata', function () {
    const pipelines = pipelinesToSteps({
      p1: [
        'rw',
      ],
    })
    parser.validateSteps({ pipelines, properties }, checks)

    const expIssue = validators.operationPropertiesExist.validate('not-null', 'rw-step', 'rw')
    assert(checkArrayContainsObject(checks.pipelines.p1, expIssue))
  })

  it('should report operations missing p:Operation', function () {
    const pipelines = pipelinesToSteps({
      p1: [
        'e',
      ],
    })
    parser.validateSteps({ pipelines, properties }, checks)

    const expIssue = validators.operationHasOperationProperty.validate(false, 'e-step', 'e')
    assert(checkArrayContainsObject(checks.pipelines.p1, expIssue))
  })

  it('should report non-writable operation being written into', function () {
    const pipelines = pipelinesToSteps({
      p1: [
        'or',
        'orw',
        'or',
      ],
    })
    parser.validateSteps({ pipelines, properties }, checks)
    const expIssue = validators.writableAfterReadable.validate(false, 'or-step', 'or')
    assert(checkArrayContainsObject(checks.pipelines.p1, expIssue))
  })

  it('should report error if first operation is writable', function () {
    const pipelines = pipelinesToSteps({
      p1: [
        'ow',
        'orw',
      ],
    })
    parser.validateSteps({ pipelines, properties }, checks)

    const expIssue = validators.firstOperationIsReadable.validate(false, 'ow-step', 'ow')
    assert(checkArrayContainsObject(checks.pipelines.p1, expIssue))
  })

  it('should report bad mix of normal streams and object-mode streams', function () {
    const pipelines = pipelinesToSteps({
      p1: [
        'or',
        'orW',
      ],
      p2: [
        'oR',
        'orw',
      ],
      p3: [
        'oR',
        'oRw',
      ],
      p4: [
        'or',
        'orw',
        'orW',
      ],
    })
    parser.validateSteps({ pipelines, properties }, checks)

    const expectedErrors = {
      p1: ['orW', validators.readableObjectModeBeforeWritableObjectMode.messageFailureTemplate({ operation: 'orW' })],
      p2: ['orw', validators.readableBeforeWritable.messageFailureTemplate({ operation: 'orw' })],
      p3: ['oRw', validators.readableBeforeWritable.messageFailureTemplate({ operation: 'oRw' })],
      p4: ['orW', validators.readableObjectModeBeforeWritableObjectMode.messageFailureTemplate({ operation: 'orW' })],
    }

    Object.keys(pipelines).forEach((pipeline) => {
      const [, errorMessage] = expectedErrors[pipeline]
      pipelineContainsMessage(checks, errorMessage, pipeline)
    })
  })
})
