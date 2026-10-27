import { strictEqual } from 'node:assert'
import env from 'barnard59-env'
import metadataUnbound from '../lib/metadata.js'
import createPipelineDefinition from './support/createPipelineDefinition.js'

const metadata = metadataUnbound.bind(null, env)

describe('metadata', function () {
  it('should be a function', function () {
    strictEqual(typeof metadata, 'function')
  })

  it('should return an object', function () {
    const meta = metadata(createPipelineDefinition())

    strictEqual(typeof meta, 'object')
  })

  it('should set readable to true if type is p:Readable', function () {
    const meta = metadata(createPipelineDefinition({ readable: true }))

    strictEqual(meta.readable, true)
  })

  it('should set readableObjectMode to false if type is p:Readable', function () {
    const meta = metadata(createPipelineDefinition({ readable: true }))

    strictEqual(meta.readableObjectMode, false)
  })

  it('should set readable and readableObject to true if type is p:ReadableObjectMode', function () {
    const meta = metadata(createPipelineDefinition({ readableObjectMode: true }))

    strictEqual(meta.readable, true)
    strictEqual(meta.readableObjectMode, true)
  })

  it('should set writable to true if type is p:Writable', function () {
    const meta = metadata(createPipelineDefinition({ writable: true }))

    strictEqual(meta.writable, true)
  })

  it('should set writableObjectMode to false if type is p:Writable', function () {
    const meta = metadata(createPipelineDefinition({ writable: true }))

    strictEqual(meta.writableObjectMode, false)
  })

  it('should set writeable and writableObjectMode to true if type is p:WritableObjectMode', function () {
    const meta = metadata(createPipelineDefinition({ writableObjectMode: true }))

    strictEqual(meta.writable, true)
    strictEqual(meta.writableObjectMode, true)
  })
})
