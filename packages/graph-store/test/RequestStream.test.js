/* global describe, expect, test */

const RequestStream = require('../lib/RequestStream')

describe('RequestStream', () => {
  test('is a constructor', () => {
    expect(typeof RequestStream).toBe('function')
  })
})
