const sinon = require('sinon')

class ClownfaceMock {
  constructor () {
    this.term = null
  }

  namedNode () {
    return null
  }

  has () {
    return null
  }

  in () {
    return null
  }

  out () {
    return null
  }

  list () {
    return null
  }
}

const step1 = sinon.createStubInstance(ClownfaceMock, {
  out: sinon.stub().returnsThis()
})
step1.term = 'My awesome step1'
const step2 = sinon.createStubInstance(ClownfaceMock, {
  out: sinon.stub().returnsThis()
})
step2.term = 'My awesome step2'

const pipeline1 = sinon.createStubInstance(ClownfaceMock, {
  out: sinon.stub().returnsThis(),
  list: [step1, step2]
})
pipeline1.term = { value: 'abc' }

const pipeline2 = sinon.createStubInstance(ClownfaceMock, {
  out: sinon.stub().returnsThis(),
  list: [step2, step1]
})
pipeline2.term = { value: 'def' }

const graph = sinon.createStubInstance(ClownfaceMock, {
  has: [pipeline1, pipeline2]
})

const pipeline2identifier = {}

graph
  .has()
  .forEach(pipeline => {
    const steps = pipeline
      .out()
      .out()
      .list()

    pipeline2identifier[pipeline.term.value] = []

    for (const step of steps) {
      const identifier = step
        .out()
        .out()
        .term
      pipeline2identifier[pipeline.term.value].push(identifier)
    }
  })
console.log(pipeline2identifier)
