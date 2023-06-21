import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import metadata from '../lib/metadata.js'
import createPipelineDefinition from './support/createPipelineDefinition.js'

describe('metadata', () => {
  it('should be a function', () => {
    strictEqual(typeof metadata, 'function')
  })

  it('should return an object', () => {
    const meta = metadata(createPipelineDefinition())

    strictEqual(typeof meta, 'object')
  })

  it('should set readable to true if type is p:Readable', () => {
    const meta = metadata(createPipelineDefinition({ readable: true }))

    strictEqual(meta.readable, true)
  })

  it('should set readableObjectMode to false if type is p:Readable', () => {
    const meta = metadata(createPipelineDefinition({ readable: true }))

    strictEqual(meta.readableObjectMode, false)
  })

  it('should set readable and readableObject to true if type is p:ReadableObjectMode', () => {
    const meta = metadata(createPipelineDefinition({ readableObjectMode: true }))

    strictEqual(meta.readable, true)
    strictEqual(meta.readableObjectMode, true)
  })

  it('should set writable to true if type is p:Writable', () => {
    const meta = metadata(createPipelineDefinition({ writable: true }))

    strictEqual(meta.writable, true)
  })

  it('should set writableObjectMode to false if type is p:Writable', () => {
    const meta = metadata(createPipelineDefinition({ writable: true }))

    strictEqual(meta.writableObjectMode, false)
  })

  it('should set writeable and writableObjectMode to true if type is p:WritableObjectMode', () => {
    const meta = metadata(createPipelineDefinition({ writableObjectMode: true }))

    strictEqual(meta.writable, true)
    strictEqual(meta.writableObjectMode, true)
  })
})
