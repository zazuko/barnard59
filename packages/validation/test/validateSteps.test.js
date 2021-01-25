const { describe, it } = require('mocha')
const assert = require('assert')
const parser = require('../lib/parser')
const checks = require('../lib/schema')

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

function errorsForPipeline (errors, pipeline) {
  const [_p, errs] = errors.find(([p]) => p === pipeline)
  return errs.filter(error => error.level !== 'info')
}

function infoForPipeline (errors, pipeline) {
  const [_p, errs] = errors.find(([p]) => p === pipeline)
  return errs.filter(error => error.level === 'info')
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

let errors

describe('parser.validateSteps', () => {
  beforeEach(() => {
    errors = []
  })

  it('should accept valid pipelines', () => {
    const pipelines = pipelinesToSteps({
      p1: ['or', 'orw', 'ow'],
      p2: ['or', 'orw', 'orw', 'orw', 'orw', 'ow'],
      p3: ['or'],
      p4: ['orw'],
      p5: ['o']
    })
    parser.validateSteps({ pipelines, properties }, errors)
    Object.keys(pipelines).forEach((pipeline) => {
      assert.deepStrictEqual(errorsForPipeline(errors, pipeline), [])
    })
  })

  it('should accept valid pipelines -- object mode', () => {
    const pipelines = pipelinesToSteps({
      p1: ['oR', 'oRW', 'oW'],
      p2: ['oR', 'oRW', 'oRW', 'oRW', 'oRW', 'oW'],
      p3: ['oR'],
      p4: ['oRW']
    })
    parser.validateSteps({ pipelines, properties }, errors)
    Object.keys(pipelines).forEach((pipeline) => {
      assert.deepStrictEqual(errorsForPipeline(errors, pipeline), [])
    })
  })

  it('should report missing metadata', () => {
    const pipelines = pipelinesToSteps({
      p1: [
        'n'
      ]
    })
    parser.validateSteps({ pipelines, properties }, errors)

    const errs = errorsForPipeline(errors, 'p1')
    assert.strictEqual(errs.length, 1)
    assert.strictEqual(errs[0].level, 'warning')
    assert.strictEqual(errs[0].message, checks.operationPropertiesExist.messageFailure('n'))
  })
  it('should report found metadata', () => {
    const pipelines = pipelinesToSteps({
      p1: [
        'rw'
      ]
    })
    parser.validateSteps({ pipelines, properties }, errors)

    const errs = infoForPipeline(errors, 'p1')
    assert.strictEqual(errs[0].message, checks.operationPropertiesExist.messageSuccess('rw'))
  })

  it('should report operations missing p:Operation', () => {
    const pipelines = pipelinesToSteps({
      p1: [
        'e'
      ]
    })
    parser.validateSteps({ pipelines, properties }, errors)

    const errs = errorsForPipeline(errors, 'p1')
    assert.strictEqual(errs.length, 1)
    assert.strictEqual(errs[0].level, 'error')
    assert.strictEqual(errs[0].message, 'Invalid operation: it is not a https://pipeline.described.at/Operation')
  })

  it('should report non-writable operation being written into', () => {
    const pipelines = pipelinesToSteps({
      p1: [
        'or',
        'orw',
        'or'
      ]
    })
    parser.validateSteps({ pipelines, properties }, errors)

    const errs = errorsForPipeline(errors, 'p1')
    assert.strictEqual(errs.length, 1)
    assert.strictEqual(errs[0].level, 'error')
    assert.strictEqual(errs[0].step, 'or-step')
    assert.strictEqual(errs[0].operation, 'or')
    assert.strictEqual(errs[0].message, 'Invalid operation: operation is not Writable')
  })

  it('should report first operation not writable', () => {
    const pipelines = pipelinesToSteps({
      p1: [
        'ow',
        'orw'
      ]
    })
    parser.validateSteps({ pipelines, properties }, errors)

    const errs = errorsForPipeline(errors, 'p1')
    assert.strictEqual(errs.length, 2)
    assert.strictEqual(errs[0].level, 'error')
    assert.strictEqual(errs[0].step, 'ow-step')
    assert.strictEqual(errs[0].operation, 'ow')
    assert.strictEqual(errs[0].message, 'Invalid operation: it is neither https://pipeline.described.at/Readable nor https://pipeline.described.at/ReadableObjectMode')
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
    parser.validateSteps({ pipelines, properties }, errors)

    const expectedErrors = {
      p1: ['orW', 'Invalid operation: previous operation is not ReadableObjectMode'],
      p2: ['orw', 'Invalid operation: previous operation is not Readable'],
      p3: ['oRw', 'Invalid operation: previous operation is not Readable'],
      p4: ['orW', 'Invalid operation: previous operation is not ReadableObjectMode']
    }

    Object.keys(pipelines).forEach((pipeline) => {
      const [erroredOp, errorMessage] = expectedErrors[pipeline]
      const errs = errorsForPipeline(errors, pipeline)
      assert.strictEqual(errs.length, 2, pipeline)
      assert.strictEqual(errs[0].level, 'error', pipeline)
      assert.strictEqual(errs[0].operation, erroredOp, pipeline)
      assert.strictEqual(errs[0].message, errorMessage, pipeline)
    })
  })
})
