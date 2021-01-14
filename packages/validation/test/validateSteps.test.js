const parser = require('../lib/parser')
const { describe, it } = require('mocha')
const assert = require('assert')

const properties = {
  or: ['Operation', 'Readable'],
  orw: ['Operation', 'Readable', 'Writable'],
  ow: ['Operation', 'Writable'],
  rw: ['Readable', 'Writable'],
  e: [],
  n: null
}

function errorsForPipeline (errors, pipeline) {
  return errors.filter(([p]) => p === pipeline).map(([_p, errs]) => errs)[0]
}

let errors

describe('parser.validateSteps', () => {
  beforeEach(() => {
    errors = []
  })

  it('should accept valid pipelines', () => {
    const pipelines = {
      p1: [
        'or',
        'orw',
        'ow'
      ],
      p2: [
        'or',
        'orw',
        'orw',
        'orw',
        'orw',
        'ow'
      ]
    }
    parser.validateSteps({ pipelines, properties }, errors)
    assert.deepStrictEqual(errorsForPipeline(errors, 'p1'), [])
    assert.deepStrictEqual(errorsForPipeline(errors, 'p2'), [])
  })

  it('should report missing metadata', () => {
    const pipelines = {
      p1: [
        'n'
      ]
    }
    parser.validateSteps({ pipelines, properties }, errors)

    const errs = errorsForPipeline(errors, 'p1')
    assert.strictEqual(errs.length, 1)
    assert.strictEqual(errs[0].level, 'warning')
    assert.strictEqual(errs[0].message, 'Cannot validate operation: no metadata')
  })

  it('should report operations missing p:Operation', () => {
    const pipelines = {
      p1: [
        'e'
      ]
    }
    parser.validateSteps({ pipelines, properties }, errors)

    const errs = errorsForPipeline(errors, 'p1')
    assert.strictEqual(errs.length, 1)
    assert.strictEqual(errs[0].level, 'error')
    assert.strictEqual(errs[0].message, 'Invalid operation: it is not a https://pipeline.described.at/Operation')
  })

  it('should report non-writable operation being written into', () => {
    const pipelines = {
      p1: [
        'or',
        'orw',
        'or'
      ]
    }
    parser.validateSteps({ pipelines, properties }, errors)

    const errs = errorsForPipeline(errors, 'p1')
    assert.strictEqual(errs.length, 1)
    assert.strictEqual(errs[0].level, 'error')
    assert.strictEqual(errs[0].operation, 'or')
    assert.strictEqual(errs[0].message, 'Invalid operation: operation is not Writable')
  })

  it('should report first operation not writable', () => {
    const pipelines = {
      p1: [
        'ow',
        'orw'
      ]
    }
    parser.validateSteps({ pipelines, properties }, errors)

    const errs = errorsForPipeline(errors, 'p1')
    assert.strictEqual(errs.length, 2)
    assert.strictEqual(errs[0].level, 'error')
    assert.strictEqual(errs[0].operation, 'ow')
    assert.strictEqual(errs[0].message, 'Invalid operation: it is neither https://pipeline.described.at/Readable nor https://pipeline.described.at/ReadableObjectMode')
  })
})
