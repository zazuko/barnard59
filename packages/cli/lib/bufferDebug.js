import stream from 'readable-stream'
import Histogram from './Histogram.js'

const { finished } = stream

function bufferStatePair({ index, mode, state, step }) {
  const key = `[${index}] (${mode}) ${step.ptr.value} (${state.length}/${state.highWaterMark})`
  const value = state.length > 0 ? Math.round(state.length / state.highWaterMark * 100.0) : 0

  return { key, value }
}

function bufferInfo(pipeline) {
  const steps = pipeline.children

  if (!steps) {
    return
  }

  return steps.reduce((data, step, index) => {
    if (step.stream._writableState) {
      const { key, value } = bufferStatePair({
        index,
        mode: 'write',
        state: step.stream._writableState,
        step,
      })

      data[key] = value
    }

    if (step.stream._readableState) {
      const { key, value } = bufferStatePair({
        index,
        mode: 'read',
        state: step.stream._readableState,
        step,
      })

      data[key] = value
    }

    return data
  }, {})
}

function bufferDebug(pipeline, { interval = 10 } = {}) {
  let done = false

  finished(pipeline.stream, () => {
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

export default bufferDebug
