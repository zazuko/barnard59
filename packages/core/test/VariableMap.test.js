import { expect } from 'chai'
import { describe, it } from 'mocha'
import { VariableMap } from '../lib/VariableMap.js'

describe('VariableMap', () => {
  describe('get', () => {
    it('throws when variable is undefined', () => {
      // given
      const vars = new VariableMap()

      // then
      expect(() => {
        vars.get('foo')
      }).to.throw()
    })

    it('returns undefined when variable is not required', () => {
      // given
      const vars = new VariableMap()
      vars.set('optional', undefined, { optional: true })

      // when
      const value = vars.get('optional')

      // then
      expect(value).to.be.undefined
    })
  })

  describe('merge', () => {
    it('merges arrays of entries', () => {
      // given
      const left = [['foo', 5]]
      const right = [['bar', 10]]

      // when
      const merged = VariableMap.merge(left, right)

      // then
      expect([...merged.entries()]).to.contain.deep.members([
        ['foo', 5],
        ['bar', 10]
      ])
    })

    it('merges plain maps', () => {
      // given
      const left = new Map([['foo', 5]])
      const right = new Map([['bar', 10]])

      // when
      const merged = VariableMap.merge(left, right)

      // then
      expect([...merged.entries()]).to.contain.deep.members([
        ['foo', 5],
        ['bar', 10]
      ])
    })

    it('merges VariableMaps with optional', () => {
      // given
      const left = new VariableMap([['foo', 5]])
      const right = new VariableMap([['bar', 10]])
      left.set('baz', undefined, { optional: true })

      // when
      const merged = VariableMap.merge(left, right)

      // then
      expect([...merged.entries()]).to.contain.deep.members([
        ['foo', 5],
        ['bar', 10]
      ])
      expect(merged.optionalVariables).to.contain('baz')
    })
  })
})
