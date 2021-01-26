
const utils = require('./utils')

class ChecksCollection {
  constructor () {
    this.generic = []
    this.pipelines = {}
  }

  addGenericCheck (error) {
    this.generic.push(error)
    return this
  }

  addPipelineCheck (error, pipeline) {
    if (pipeline in this.pipelines) {
      this.pipelines[[pipeline]].push(error)
    }
    else {
      this.pipelines[[pipeline]] = [error]
    }
    return this
  }

  getGenericWarnings () {
    return this.generic.filter((issue) => issue.level === 'warning')
  }

  getGenericErrors () {
    return this.generic.filter((issue) => issue.level === 'error')
  }

  getGenericInfos () {
    return this.generic.filter((issue) => issue.level === 'info')
  }

  getPipelineWarnings (pipeline) {
    if (pipeline in this.pipelines) {
      return this.pipelines[[pipeline]].filter((issue) => issue.level === 'warning')
    }
    else {
      return []
    }
  }

  getPipelineErrors (pipeline) {
    if (pipeline in this.pipelines) {
      return this.pipelines[[pipeline]].filter((issue) => issue.level === 'error')
    }
    else {
      return []
    }
  }

  getPipelineInfos (pipeline) {
    if (pipeline in this.pipelines) {
      return this.pipelines[[pipeline]].filter((issue) => issue.level === 'info')
    }
    else {
      return []
    }
  }

  genericContainsMessage (mssg) {
    return utils.checkArrayContainsMessage(this.generic, mssg)
  }

  pipelineContainsMessage (mssg, pipeline) {
    return utils.checkArrayContainsMessage(this.pipelines[[pipeline]], mssg)
  }

  containsMessage (mssg) {
    if (this.genericContainsMessage(mssg)) {
      return true
    }

    for (const pipeline of this.pipelines) {
      if (this.pipelineContainsMessage(mssg, pipeline)) {
        return true
      }
    }
  }
}

module.exports = ChecksCollection
