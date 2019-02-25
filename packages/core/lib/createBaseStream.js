const once = require('lodash/once')
const DuplexPipeline = require('./DuplexPipeline')
const PlainPipeline = require('./PlainPipeline')
const ReadablePipeline = require('./ReadablePipeline')
const WritablePipeline = require('./WritablePipeline')

function createBaseStream (pipeline) {
  const init = once(pipeline.init.bind(pipeline))

  if (pipeline.readable && pipeline.writable) {
    return new DuplexPipeline(pipeline, init)
  } else if (pipeline.readable) {
    return new ReadablePipeline(pipeline, init)
  } else if (pipeline.writable) {
    return new WritablePipeline(pipeline, init)
  }

  // use the readable interface just to get the readable event to init and process the pipeline
  return new PlainPipeline(pipeline, init)
}

module.exports = createBaseStream
