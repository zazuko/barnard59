const { describe, it } = require('mocha')
const assert = require('assert')
const ChecksCollection = require('../lib/checksCollection')
const utils = require('../lib/utils')

let checks
beforeEach(() => {
  checks = new ChecksCollection()
})

describe('addGenericCheck', () => {
  it('should add check to this.generic', () => {
    checks.addGenericCheck('abc')
    const actual = checks.generic
    const expected = ['abc']
    assert.deepStrictEqual(actual, expected)
  })
})

describe('addPipelineCheck', () => {
  it('should add check to this.pipelines[[pipeline]]', () => {
    checks.addPipelineCheck('check1', 'pipelineA')
    checks.addPipelineCheck('check2', 'pipelineA')
    checks.addPipelineCheck('check3', 'pipelineB')
    const actual = checks.pipelines
    const expected = { pipelineA: ['check1', 'check2'], pipelineB: ['check3'] }
    assert.deepStrictEqual(actual, expected)
  })
})

describe('getGenericChecks', () => {
  it('should get all generic checks', () => {
    checks.addGenericCheck('abc')
    checks.addPipelineCheck('check1', 'pipelineA')
    checks.addGenericCheck('def')

    const actual = checks.getGenericChecks()
    const expected = ['abc', 'def']
    assert.deepStrictEqual(actual, expected)
  })
  it('should get all generic checks of given level', () => {
    checks.addGenericCheck({ name: 'volleyball', level: 'beginner' })
    checks.addGenericCheck({ name: 'beach volley', level: 'beginner' })
    checks.addGenericCheck({ name: 'basketball', level: 'intermediate' })
    checks.addGenericCheck({ name: 'football', level: 'advanced' })

    const actual = checks.getGenericChecks(['beginner'])
    const expected = [{ name: 'volleyball', level: 'beginner' }, { name: 'beach volley', level: 'beginner' }]
    assert.deepStrictEqual(actual, expected)
  })
  it('should get all generic checks of multiple levels', () => {
    checks.addGenericCheck({ name: 'volleyball', level: 'beginner' })
    checks.addGenericCheck({ name: 'beach volley', level: 'beginner' })
    checks.addGenericCheck({ name: 'basketball', level: 'intermediate' })
    checks.addGenericCheck({ name: 'football', level: 'advanced' })

    const actual = checks.getGenericChecks(['intermediate', 'advanced'])
    const expected = [{ name: 'basketball', level: 'intermediate' }, { name: 'football', level: 'advanced' }]
    assert.deepStrictEqual(actual, expected)
  })
})

describe('getPipelineChecks', () => {
  it('should get all pipeline checks', () => {
    checks.addGenericCheck('abc')
    checks.addPipelineCheck('check1', 'pipelineA')
    checks.addPipelineCheck('check2', 'pipelineA')
    checks.addPipelineCheck('check3', 'pipelineB')

    const actual = checks.getPipelineChecks('pipelineA')
    const expected = ['check1', 'check2']
    assert.deepStrictEqual(actual, expected)
  })
  it('should get all pipline checks of multiple levels', () => {
    checks.addPipelineCheck({ name: 'volleyball', level: 'beginner' }, 'pipelineA')
    checks.addPipelineCheck({ name: 'beach volley', level: 'beginner' }, 'pipelineA')
    checks.addPipelineCheck({ name: 'basketball', level: 'intermediate' }, 'pipelineA')
    checks.addPipelineCheck({ name: 'football', level: 'advanced' }, 'pipelineA')

    const actual = checks.getPipelineChecks('pipelineA', ['intermediate', 'advanced'])
    const expected = [{ name: 'basketball', level: 'intermediate' }, { name: 'football', level: 'advanced' }]
    assert.deepStrictEqual(actual, expected)
  })
})

describe('getChecks', () => {
  it('should get all checks', () => {
    checks.addGenericCheck('abc')
    checks.addPipelineCheck('check1', 'pipelineA')
    checks.addPipelineCheck('check2', 'pipelineA')
    checks.addPipelineCheck('check3', 'pipelineB')

    const actual = checks.getChecks()
    const expected = ['abc', 'check1', 'check2', 'check3']
    assert.deepStrictEqual(actual, expected)
  })
  it('should get all pipline checks of multiple levels', () => {
    checks.addPipelineCheck({ name: 'volleyball', level: 'beginner' }, 'pipelineA')
    checks.addPipelineCheck({ name: 'beach volley', level: 'beginner' }, 'pipelineB')
    checks.addPipelineCheck({ name: 'basketball', level: 'intermediate' }, 'pipelineC')
    checks.addGenericCheck({ name: 'football', level: 'advanced' })

    const actual = checks.getChecks(['intermediate', 'advanced'])
    const expected = [{ name: 'football', level: 'advanced' }, { name: 'basketball', level: 'intermediate' }]
    assert.deepStrictEqual(actual, expected)
  })
})

describe('containsMessage', () => {
  it('should return true if message exists in checks', () => {
    checks.addGenericCheck({ name: 'volleyball', message: 'This message exists' })
    checks.addPipelineCheck({ name: 'football', message: 'And this as well!' }, 'pipeline of awesome')
    const expected = true
    const actual = checks.containsMessage('This message exists')
    assert(actual === expected)
  })
  it('should return false if message does not exists in checks', () => {
    checks.addGenericCheck({ name: 'volleyball', message: 'This message exists' })
    checks.addPipelineCheck({ name: 'football', message: 'And this as well!' }, 'pipeline of awesome')
    const expected = false
    const actual = checks.containsMessage('No such message')
    assert(actual === expected)
  })
})

describe('countChecks', () => {
  it('should return checks count', () => {
    checks.addGenericCheck('abc')
    checks.addPipelineCheck('check1', 'pipelineA')
    checks.addPipelineCheck('check2', 'pipelineA')
    checks.addPipelineCheck('check3', 'pipelineB')

    const expected = 5
    const actual = checks.countChecks()
    assert(actual === expected)
  })
})
