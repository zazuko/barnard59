const { describe, it } = require('mocha')
const assert = require('assert')
const utils = require('../lib/utils')
const fs = require('fs')
const { checkArrayContainsField, checkArrayContainsObject } = require('./helpers')

describe('utils.removeFilePart', () => {
  it('should remove last file part', () => {
    const input = 'a/b/c'
    const expected = 'a/b'
    const actual = utils.removeFilePart(input)
    assert.strictEqual(actual, expected)
  })

  it('should remove last file part, if it has extension', () => {
    const input = 'a/b/c.txt'
    const expected = 'a/b'
    const actual = utils.removeFilePart(input)
    assert.strictEqual(actual, expected)
  })
})
describe('checkArrayContainsField', () => {
  const array = [{ gender: 'male', age: 38 }, { gender: 'male', job: 'unemployed' }]
  it('should return true if field with given value exists in at least one object', () => {
    const expected = true
    const actual = checkArrayContainsField(array, 'age', 38)
    assert.strictEqual(actual, expected)
  })

  it('should return false if field with given value does not exists in any object', () => {
    const expected = false
    const actual = checkArrayContainsField(array, 'age', 17)
    assert.strictEqual(actual, expected)
  })

  it('should return false if field does not exists in any object', () => {
    const expected = false
    const actual = checkArrayContainsField(array, 'address', 'Bahnhofstrasse')
    assert.strictEqual(actual, expected)
  })
})

describe('checkArrayContainsObject', () => {
  const array = [{ gender: 'male', age: 38 }, { gender: 'male', job: 'unemployed' }]
  it('should return true if same object exists in array', () => {
    const obj = { gender: 'male', age: 38 }
    const expected = true
    const actual = checkArrayContainsObject(array, obj)
    assert.strictEqual(actual, expected)
  })

  it('should return false if same object does not exists in array', () => {
    const objects = [{ gender: 'male', age: 17 }, { phone: 123 }, {}]
    const expected = false
    for (const obj of objects) {
      const actual = checkArrayContainsObject(array, obj)
      assert.strictEqual(actual, expected)
    }
  })
})

describe('utils.isModuleInstalled', () => {
  it('should return true if module is installed', () => {
    const expected = true
    const actual = utils.isModuleInstalled('clownface')
    assert.strictEqual(actual, expected)
  })

  it('should return false if module is not installed', () => {
    const expected = false
    const actual = utils.isModuleInstalled('inexistent-module')
    assert.strictEqual(actual, expected)
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
    assert.strictEqual(actual, expected)
  })

  it('should return null if module is installed, but no manifest exists', () => {
    const expected = null
    const actual = utils.getManifestPath('clownface')
    assert.strictEqual(actual, expected)
  })

  it('should override manifest location for known packages', () => {
    const actual = utils.getManifestPath('fs')
    assert(actual.endsWith('/node_modules/barnard59-core/manifest.ttl'))
  })
})

describe('utils.template', () => {
  /* eslint-disable no-template-curly-in-string */
  const getMenu = utils.template`Today's menu is ${'dish'} with ${'wine'}`

  it('should replace key variables in template', () => {
    const expected = 'Today\'s menu is pizza with red wine'
    const actual = getMenu({ dish: 'pizza', wine: 'red wine' })
    assert.strictEqual(actual, expected)
  })

  it('should return template when no variables are passed', () => {
    const expected = 'Today\'s menu is ${dish} with ${wine}'
    const actual = getMenu()
    assert.strictEqual(actual, expected)
  })

  it('should return template when empty array is passed', () => {
    const expected = 'Today\'s menu is ${dish} with ${wine}'
    const actual = getMenu({})
    assert.strictEqual(actual, expected)
  })
})
