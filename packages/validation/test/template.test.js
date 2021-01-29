/* eslint-disable no-template-curly-in-string */
const { describe, it } = require('mocha')
const assert = require('assert')
const template = require('../lib/template')

describe('template', () => {
  const getMenu = template`Today's menu is ${'dish'} with ${'wine'}`
  it('should replace key variables in template', () => {
    const expected = 'Today\'s menu is pizza with red wine'
    const actual = getMenu({ dish: 'pizza', wine: 'red wine' })
    assert(actual === expected)
  })
  it('should return template when no variables are passed', () => {
    const expected = 'Today\'s menu is ${dish} with ${wine}'
    const actual = getMenu()
    assert(actual === expected)
  })
  it('should return template when empty array is passed', () => {
    const expected = 'Today\'s menu is ${dish} with ${wine}'
    const actual = getMenu({})
    assert(actual === expected)
  })
})
