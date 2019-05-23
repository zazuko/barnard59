/* global describe, expect, test */

const Queue = require('../lib/Queue')

describe('Queue', () => {
  test('is a constructor', () => {
    expect(typeof Queue).toBe('function')
  })

  describe('enqueue', () => {
    test('is a function', () => {
      const queue = new Queue()

      expect(typeof queue.enqueue).toBe('function')
    })

    test('adds a chunk and commit to the item list', () => {
      const chunk = {}
      const commit = () => {}
      const queue = new Queue()

      queue.enqueue(chunk, commit)

      expect(queue.items[0].chunk).toBe(chunk)
      expect(queue.items[0].commit).toBe(commit)
    })
  })

  describe('dequeue', () => {
    test('is a function', () => {
      const queue = new Queue()

      expect(typeof queue.dequeue).toBe('function')
    })

    test('returns undefined if there is not item', () => {
      const queue = new Queue()

      expect(queue.dequeue()).toBe(undefined)
    })

    test('returns the chunks of the next item', () => {
      const item0 = { chunk: {}, commit: () => {} }
      const item1 = { chunk: {}, commit: () => {} }
      const items = [ item0, item1 ]
      const queue = new Queue()

      queue.items = items

      expect(queue.dequeue()).toBe(item0.chunk)
    })

    test('calls the commit function of the item', async () => {
      let called = false
      const item0 = { chunk: {}, commit: () => { called = true } }
      const item1 = { chunk: {}, commit: () => {} }
      const items = [ item0, item1 ]
      const queue = new Queue()

      queue.items = items
      queue.dequeue()

      await (new Promise(resolve => {
        setImmediate(() => {
          expect(called).toBe(true)
          resolve()
        })
      }))
    })

    test('removes the item', () => {
      const item0 = { chunk: {}, commit: () => {} }
      const item1 = { chunk: {}, commit: () => {} }
      const items = [ item0, item1 ]
      const queue = new Queue()

      queue.items = items
      queue.dequeue()

      expect(queue.items).toStrictEqual([ item1 ])
    })
  })

  describe('peek', () => {
    test('is a function', () => {
      const queue = new Queue()

      expect(typeof queue.peek).toBe('function')
    })

    test('returns undefined if there is not item', () => {
      const queue = new Queue()

      expect(queue.peek()).toBe(undefined)
    })

    test('returns the chunks of the next item', () => {
      const item0 = { chunk: {}, commit: () => {} }
      const item1 = { chunk: {}, commit: () => {} }
      const items = [ item0, item1 ]
      const queue = new Queue()

      queue.items = items

      expect(queue.peek()).toBe(item0.chunk)
    })

    test('doesn\'t call the commit function of the item', async () => {
      let called = false
      const item0 = { chunk: {}, commit: () => { called = true } }
      const item1 = { chunk: {}, commit: () => {} }
      const items = [ item0, item1 ]
      const queue = new Queue()

      queue.items = items
      queue.peek()

      await (new Promise(resolve => {
        setImmediate(() => {
          expect(called).toBe(false)
          resolve()
        })
      }))
    })

    test('doesn\'t remove the item', () => {
      const item0 = { chunk: {}, commit: () => {} }
      const item1 = { chunk: {}, commit: () => {} }
      const items = [ item0, item1 ]
      const queue = new Queue()

      queue.items = items
      queue.peek()

      expect(queue.items).toStrictEqual([ item0, item1 ])
    })
  })
})
