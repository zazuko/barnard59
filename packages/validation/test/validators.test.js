/* eslint import/namespace: ['error', { allowComputed: true }] */
import assert from 'assert'
import * as validators from '../lib/validators/index.js'

describe('validators', () => {
  const requiredFields = ['ruleDescription',
    'ruleId',
    'messageSuccessTemplate',
    'messageFailureTemplate',
    'validate',
    'describeRule']
  it('should have all required fields', () => {
    const containsAllFields = (arr, target) => target.every(v => arr.includes(v))
    for (const validator of Object.keys(validators)) {
      if (validator !== 'index') {
        assert(containsAllFields(Object.keys(validators[validator]), requiredFields))
      }
    }
  })
})
