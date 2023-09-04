import { log } from './log.js'

export default class ChecksCollection {
  constructor() {
    this.generic = []
    this.pipelines = {}
  }

  addGenericCheck(error) {
    this.generic.push(error)
  }

  addPipelineCheck(error, pipeline) {
    if (pipeline in this.pipelines) {
      this.pipelines[pipeline].push(error)
    } else {
      this.pipelines[pipeline] = [error]
    }
  }

  getGenericChecks(levels = null) {
    if (levels !== null) {
      return this.generic.filter((issue) => levels.includes(issue.level))
    }
    return this.generic
  }

  getPipelineChecks(pipeline, levels = null) {
    if (pipeline in this.pipelines) {
      if (levels !== null) {
        return this.pipelines[pipeline].filter((issue) => levels.includes(issue.level))
      }
      return this.pipelines[pipeline]
    }
    return []
  }

  getChecks(levels = null) {
    let checks = this.getGenericChecks(levels)
    for (const pipeline of Object.keys(this.pipelines)) {
      checks = checks.concat(this.getPipelineChecks(pipeline, levels))
    }
    return checks
  }

  countChecks(levels) {
    return this.getChecks(levels).length
  }

  countIssues(strict = false) {
    if (strict) {
      return this.countChecks(['error', 'warning'])
    }
    return this.countChecks('error')
  }

  print(levels) {
    for (const issue of this.getGenericChecks(levels)) {
      log.error(`${issue}`)
    }

    let i = 0
    for (const pipeline of Object.keys(this.pipelines)) {
      const issues = this.getPipelineChecks(pipeline, levels)
      if (issues.length > 0) {
        log.error(`${i + 1}. In pipeline <${pipeline}>`)
        issues.forEach((issue) => {
          log.error(`${issue}`)
        })
      }
      i++
    }
  }

  filterToJSON(levels) {
    return JSON.stringify(this.getChecks(levels))
  }
}
