const { finished } = require('readable-stream')
const Histogram = require('./Histogram')

function bufferStatePair ({ index, mode, state, step }) {
  const key = `[${index}] (${mode}) ${step.value} (${state.length}/${state.highWaterMark})`
  const value = state.length > 0 ? Math.round(state.length / state.highWaterMark * 100.0) : 0

  return { key, value }
}

function bufferInfo (pipeline) {
  const streams = pipeline._pipeline.streams

  if (!streams) {
    return
  }

  return streams.reduce((data, stream, index) => {
    const step = pipeline._pipeline.steps[index]

    if (stream._writableState) {
      const { key, value } = bufferStatePair({
        index,
        mode: 'write',
        state: stream._writableState,
        step
      })

      data[key] = value
    }

    if (stream._readableState) {
      const { key, value } = bufferStatePair({
        index,
        mode: 'read',
        state: stream._readableState,
        step
      })

      data[key] = value
    }

    return data
  }, {})
}

function bufferDebug (pipeline, { interval = 1000 } = {}) {
  let done = false

  finished(pipeline, () => {
    done = true
  })

  const histogram = new Histogram()

  const next = async () => {
    if (done) {
      return
    }

    const data = bufferInfo(pipeline)

    if (data) {
      await histogram.draw(data)
    }

    setTimeout(next, interval)
  }

  next()
}

module.exports = bufferDebug
