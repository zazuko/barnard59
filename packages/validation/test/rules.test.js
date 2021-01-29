const { describe, it } = require('mocha')
const assert = require('assert')
const rules = require('../lib/rules')
const validators = require('../lib/validators')
const fs = require('fs')

describe('rules', () => {
  const requiredFields = ['ruleId', 'ruleDescription', 'messageSuccess', 'messageFailure']
  it('should produce array of rules', () => {
    assert(Array.isArray(rules))
  })
  it('it should have ruleId, ruleDescription, messageSuccess, messageFailure for each rule', () => {
    for (const rule of rules) {
      for (const field of requiredFields) {
        assert(field in rule)
      }
    }
  })
  it('should have as many rules as validators', () => {
    assert((Object.keys(validators).length - 1) === rules.length) // -1 for index.js
  })
  it('the rule fields should be non-empty', () => {
    for (const field of requiredFields) {
      if (field !== 'ruleID') {
        continue
      }
      for (const rule of rules) {
        assert(rule[[field]].length > 10)
      }
    }
  })
  it('the ruleId needs to be a number', () => {
    for (const rule of rules) {
      assert(typeof (rule.ruleId) === 'number')
    }
  })
})
