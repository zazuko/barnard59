
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

  getGenericChecks (levels = null) {
    if (levels !== null) {
      return this.generic.filter((issue) => levels.includes(issue.level))
    }
    else {
      return this.generic
    }
  }

  getPipelineChecks (pipeline, levels = null) {
    if (pipeline in this.pipelines) {
      if (levels !== null) {
        return this.pipelines[[pipeline]].filter((issue) => levels.includes(issue.level))
      }
      else {
        return this.pipelines[[pipeline]]
      }
    }
    else {
      return []
    }
  }

  getChecks (levels = null) {
    let checks = this.getGenericChecks(levels)
    for (const pipeline of Object.keys(this.pipelines)) {
      checks = checks.concat(this.getPipelineChecks(pipeline, levels))
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

  countChecks (levels) {
    return this.getChecks(levels).length
  }

  countIssues (strict = false) {
    if (strict) {
      return this.countChecks(['error', 'warning'])
    }
    else {
      return this.countChecks('error')
    }
  }

  print (levels) {
    for (const issue of this.getGenericChecks(levels)) {
      console.error(`${issue}`)
    }

    let i = 0
    for (const pipeline of Object.keys(this.pipelines)) {
      const issues = this.getPipelineChecks(pipeline, levels)
      if (issues.length > 0) {
        console.error(`${i + 1}. In pipeline <${pipeline}>`)
        issues.forEach((issue) => {
          console.error(`${issue}`)
        })
      }
      i++
    }
  }

  filterAndJsonify (levels) {
    return JSON.stringify(this.getChecks(levels))
  }
}

module.exports = ChecksCollection
