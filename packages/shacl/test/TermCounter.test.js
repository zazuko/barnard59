import { strictEqual } from 'node:assert'
import env from 'barnard59-env'
import TermCounter from '../lib/TermCounter.js'

describe('TermCounter', function () {
  it('should count terms', async function () {
    const counter = new TermCounter(env)
    counter.add(env.ns.sh.Violation)
    counter.add(env.ns.sh.Violation)
    counter.add(env.ns.sh.Info)
    counter.add(env.ns.sh.Warning)
    counter.add(env.ns.sh.Violation)
    counter.add(env.ns.sh.Warning)

    strictEqual(counter.termMap.size, 3)
    strictEqual(counter.termMap.get(env.ns.sh.Violation), 3)
    strictEqual(counter.termMap.get(env.ns.sh.Warning), 2)
    strictEqual(counter.termMap.get(env.ns.sh.Info), 1)
  })
})
