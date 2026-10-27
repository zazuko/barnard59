import { expect } from 'chai'
import { VariableMap } from '../lib/VariableMap.js'

describe('VariableMap', function () {
  describe('get', function () {
    it('throws when variable is undefined', function () {
      // given
      const vars = new VariableMap()

      // then
      expect(() => {
        vars.get('foo')
      }).to.throw()
    })

    it('returns undefined when variable is not required', function () {
      // given
      const vars = new VariableMap()
      vars.set('optional', undefined, { optional: true })

      // when
      const value = vars.get('optional')

      // then
      expect(value).to.be.undefined
    })
  })

  describe('set', function () {
    it('sets empty string value', function () {
      // given
      const vars = new VariableMap()

      // when
      vars.set('foo', '')

      // then
      expect(vars.has('foo')).to.be.true
      expect(vars.get('foo')).to.eq('')
    })
  })

  describe('merge', function () {
    it('merges arrays of entries', function () {
      // given
      const left = [['foo', 5]]
      const right = [['bar', 10]]

      // when
      const merged = VariableMap.merge(left, right)

      // then
      expect([...merged.entries()]).to.contain.deep.members([
        ['foo', 5],
        ['bar', 10],
      ])
    })

    it('merges plain maps', function () {
      // given
      const left = new Map([['foo', 5]])
      const right = new Map([['bar', 10]])

      // when
      const merged = VariableMap.merge(left, right)

      // then
      expect([...merged.entries()]).to.contain.deep.members([
        ['foo', 5],
        ['bar', 10],
      ])
    })

    it('merges VariableMaps with optional', function () {
      // given
      const left = new VariableMap([['foo', 5]])
      const right = new VariableMap([['bar', 10]])
      left.set('baz', undefined, { optional: true })

      // when
      const merged = VariableMap.merge(left, right)

      // then
      expect([...merged.entries()]).to.contain.deep.members([
        ['foo', 5],
        ['bar', 10],
      ])
      expect(merged.optionalVariables).to.contain('baz')
    })
  })
})
