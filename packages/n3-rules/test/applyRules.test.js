import assert, { strictEqual, deepEqual } from 'assert'
import assertThrows from 'assert-throws-async'
import toStream from 'rdf-dataset-ext/toStream.js'
import env from 'barnard59-env'
import applyRules from '../applyRules.js'

const toArray = async iterable => {
  const result = []
  for await (const item of iterable) {
    result.push(item)
  }
  return result
}

const getInputArray = () => {
    const input1 = env.dataset()
    input1.add(env.quad(env.namedNode('http://example.org/s1'), env.namedNode('http://example.org/p1'), env.literal('o1')))
    input1.add(env.quad(env.namedNode('http://example.org/s1'), env.namedNode('http://example.org/p2'), env.literal('o2')))
    const input2 = env.dataset()
    input2.add(env.quad(env.namedNode('http://example.org/s2'), env.namedNode('http://example.org/p1'), env.literal('o3')))
    input2.add(env.quad(env.namedNode('http://example.org/s2'), env.namedNode('http://example.org/p2'), env.literal('o4')))
    return [Array.from(input1), Array.from(input2)]
} 

const rulesText = `
@prefix ex: <http://example.org/> .

{ ?s ex:p1 ?o } => { ?s a ex:C } .
`

describe('n3-rules', () => {
  describe('applyRules', () => {
    it('should be a factory', () => {
      strictEqual(typeof applyRules, 'function')
    })

    it('should throw an error if no argument is given', async () => {
      await assertThrows(() => applyRules(), Error)
    })

    it('should pass the input through', async () => {
      const generator = applyRules({ rulesText: '', includeInput: true })

      const inputArray = getInputArray()
      
      const outputArray = await toArray(generator(toStream(inputArray)))

      deepEqual(outputArray, inputArray)
    })

    it('should derive triples', async () => {
      const generator = applyRules({ rulesText })

      const inputArray = getInputArray()
      
      const outputArray = await toArray(generator(toStream(inputArray)))

      strictEqual(outputArray.length, 2)
      const [ output1, output2 ] = outputArray
      strictEqual(output1.length, 1)
      strictEqual(output2.length, 1)
      strictEqual(output1[0].subject.value, 'http://example.org/s1')
      strictEqual(output1[0].predicate.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
      strictEqual(output1[0].object.value, 'http://example.org/C')
      strictEqual(output2[0].subject.value, 'http://example.org/s2')
      strictEqual(output2[0].predicate.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
      strictEqual(output2[0].object.value, 'http://example.org/C')

    })

    it('should derive triples and pass input', async () => {
      const generator = applyRules({ rulesText, includeInput: true })

      const inputArray = getInputArray()
      
      const outputArray = await toArray(generator(toStream(inputArray)))

      strictEqual(outputArray.length, 2)
      const [ output1, output2 ] = outputArray
      strictEqual(output1.length, 3)
      strictEqual(output2.length, 3)
      assert(output1.some(quad => quad.subject.value === 'http://example.org/s1' && quad.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' && quad.object.value === 'http://example.org/C'))
      assert(output2.some(quad => quad.subject.value === 'http://example.org/s2' && quad.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' && quad.object.value === 'http://example.org/C'))
      assert(output1.some(quad => quad.subject.value === 'http://example.org/s1' && quad.predicate.value === 'http://example.org/p1' && quad.object.value === 'o1'))
      assert(output1.some(quad => quad.subject.value === 'http://example.org/s1' && quad.predicate.value === 'http://example.org/p2' && quad.object.value === 'o2'))
      assert(output2.some(quad => quad.subject.value === 'http://example.org/s2' && quad.predicate.value === 'http://example.org/p1' && quad.object.value === 'o3'))
      assert(output2.some(quad => quad.subject.value === 'http://example.org/s2' && quad.predicate.value === 'http://example.org/p2' && quad.object.value === 'o4'))
    })

  })
})
