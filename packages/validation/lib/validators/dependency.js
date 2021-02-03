const Issue = require('../issue')
const utils = require('../utils')
const { template } = require('../utils')

// corresponds to rdf-code-loader resolvers:
// https://github.com/zazuko/rdf-loader-code/blob/c5137d45f13c6788f9f6f161653b7cd800401a0f/lib/iriResolve.js#L4-L17
const dependencyTypes = {
  'node:': 'package',
  'file:': 'file'
}

const dependency = {
  ruleDescription: 'Each dependency must be installed',
  ruleId: 2668,
  messageSuccessTemplate: template`Found ${'dependencyType'} ${'library'} successfully`,
  messageFailureTemplate: template`Missing ${'dependencyType'} ${'library'}\n  The following operations cannot be validated:\n  * "${'operations'}"`,
  validate (library, { operations, protocol }) {
    const dependencyType = dependencyTypes[protocol]
    let issue
    if (utils.isModuleInstalled(library)) {
      issue = Issue.info({ id: this.ruleId, templateData: { library, dependencyType } })
    }
    else {
      issue = Issue.error({
        id: this.ruleId,
        templateData: { library, dependencyType, operations }
      })
    }
    return issue
  },
  describeRule () {
    return {
      ruleId: this.ruleId,
      ruleDescription: this.ruleDescription,
      messageSuccess: this.messageSuccessTemplate(),
      messageFailure: this.messageFailureTemplate()
    }
  }
}

module.exports = dependency
