
const utils = require('./utils')

class ChecksCollection {
  constructor () {
    this.generic = []
    this.pipelines = {}
  }

  setGenericCheck (error) {
    this.generic.push(error)
  }

  setPipelineCheck (error, pipeline) {
    if (pipeline in this.pipelines) {
      this.pipelines[[pipeline]].push(error)
    }
    else {
      this.pipelines[[pipeline]] = [error]
    }
  }

  getGenericChecks (level = null) {
    if (level !== null) {
      return this.generic.filter((issue) => issue.level === level)
    }
    else {
      return this.generic
    }
  }

  getPipelineChecks (pipeline, level = null) {
    if (pipeline in this.pipelines) {
      if (level !== null) {
        return this.pipelines[[pipeline]].filter((issue) => issue.level === level)
      }
      else {
        return this.pipelines[[pipeline]]
      }
    }
    else {
      return []
    }
  }

  getChecks (level = null) {
    let checks = this.getGenericChecks(level)
    for (const pipeline of Object.keys(this.pipelines)) {
      checks = checks.concat(this.getPipelineChecks(pipeline, level))
    }
    return checks
  }

  genericContainsMessage (mssg) {
    return utils.checkArrayContainsField(this.generic, 'message', mssg)
  }

  pipelineContainsMessage (mssg, pipeline) {
    return utils.checkArrayContainsField(this.pipelines[[pipeline]], 'message', mssg)
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

  countChecks (level) {
    this.generic.filter((issue) => issue.level === level)
  }
}

module.exports = ChecksCollection
