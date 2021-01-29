const { describe, it } = require('mocha')
const assert = require('assert')
const utils = require('../lib/utils')
const fs = require('fs')

describe('utils.removeFilePart', () => {
  it('should remove last file part', () => {
    const input = 'a/b/c'
    const expected = 'a/b'
    const actual = utils.removeFilePart(input)
    assert(actual === expected)
  })
  it('should remove last file part, if it has extension', () => {
    const input = 'a/b/c.txt'
    const expected = 'a/b'
    const actual = utils.removeFilePart(input)
    assert(actual === expected)
  })
})
describe('utils.checkArrayContainsField', () => {
  const array = [{ gender: 'male', age: 38 }, { gender: 'male', job: 'unemployed' }]
  it('should return true if field with given value exists in at least one object', () => {
    const expected = true
    const actual = utils.checkArrayContainsField(array, 'age', 38)
    assert(actual === expected)
  })
  it('should return false if field with given value does not exists in any object', () => {
    const expected = false
    const actual = utils.checkArrayContainsField(array, 'age', 17)
    assert(actual === expected)
  })
  it('should return false if field does not exists in any object', () => {
    const expected = false
    const actual = utils.checkArrayContainsField(array, 'address', 'Bahnhofstrasse')
    assert(actual === expected)
  })
})

describe('utils.checkArrayContainsObject', () => {
  const array = [{ gender: 'male', age: 38 }, { gender: 'male', job: 'unemployed' }]
  it('should return true if same object exists in array', () => {
    const obj = { gender: 'male', age: 38 }
    const expected = true
    const actual = utils.checkArrayContainsObject(array, obj)
    assert(actual === expected)
  })
  it('should return false if same object does not exists in array', () => {
    const objects = [{ gender: 'male', age: 17 }, { phone: 123 }, {}]
    const expected = false
    for (const obj of objects) {
      const actual = utils.checkArrayContainsObject(array, obj)
      assert(actual === expected)
    }
  })
})

describe('utils.isModuleInstalled', () => {
  it('should return true if module is installed', () => {
    const expected = true
    const actual = utils.isModuleInstalled('clownface')
    assert(actual === expected)
  })
  it('should return false if module is not installed', () => {
    const expected = false
    const actual = utils.isModuleInstalled('inexistent-module')
    assert(actual === expected)
  })
})

describe('utils.getManifestPath', () => {
  it('should return path if manifest exists', () => {
    const actual = utils.getManifestPath('barnard59-base')
    assert(fs.existsSync(actual))
  })
  it('should return null if module is not installed', () => {
    const expected = null
    const actual = utils.getManifestPath('inexistent-module')
    assert(actual === expected)
  })
  it('should return null if module is installed, but no manifest exists', () => {
    const expected = null
    const actual = utils.getManifestPath('clownface')
    assert(actual === expected)
  })
})
