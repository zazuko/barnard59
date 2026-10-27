import assert from 'node:assert'
import { rules } from '../lib/rules.js'
import * as validators from '../lib/validators/index.js'

describe('rules', function () {
  const requiredFields = ['ruleId', 'ruleDescription', 'messageSuccess', 'messageFailure']

  it('should produce array of rules', function () {
    assert(Array.isArray(rules))
  })

  it('it should have ruleId, ruleDescription, messageSuccess, messageFailure for each rule', function () {
    for (const rule of rules) {
      for (const field of requiredFields) {
        assert(field in rule)
      }
    }
  })

  it('should have as many rules as validators', function () {
    assert(Object.keys(validators).length === rules.length) // -1 for index.js
  })

  it('the rule fields should be non-empty', function () {
    for (const field of requiredFields) {
      if (field !== 'ruleID') {
        continue
      }
      for (const rule of rules) {
        assert(rule[field].length > 10)
      }
    }
  })

  it('the ruleId needs to be a number', function () {
    assert(rules.every(rule => typeof (rule.ruleId) === 'number'))
  })
})
