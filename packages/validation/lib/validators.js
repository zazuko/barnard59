const Issue = require('./issue')
const template = require('./template')
const { parseError } = require('./parser')

class GraphValidator {
  static get ruleDescription () {
    return 'Pipeline file can be parsed'
  }

  static get ruleId () {
    return 1337
  }

  static get messageSuccessTemplate () {
    return template`File ${'file'} parsed successfully`
  }

  static get messageFailureTemplate () {
    return template`Cannot parse ${'file'}:\n  ${'errorMessage'} Line ${'errorContextLine'}:\n  ${'errorContextLineContent'}`
  }

  async validate (file, parserPromise, datasetPromise, checks) {
    let issue
    try {
      const [_err, dataset] = await Promise.all([parserPromise, datasetPromise])
      issue = Issue.info({
        message: this.messageSuccessTemplate({ file })
      })
    }
    catch (err) {
      const error = await parseError(file, err)
      issue = Issue.error({
        message: this.messageSuccessTemplate({
          file,
          errorMessage: error.message,
          errorContextLine: error.context.line,
          errorContextLineContent: error.context.line.content
        })
      })
    }
    checks.setGenericCheck(issue)
  }

  static describeRule () {
    return {
      ruleId: GraphValidator.ruleId,
      ruleDescription: GraphValidator.ruleDescription,
      messageSuccess: GraphValidator.messageSuccessTemplate(),
      messageFailure: GraphValidator.messageFailureTemplate()
    }
  }
}

const validators = [
  GraphValidator
]

const rules = validators.map((cls) => cls.describeRule())

module.exports = {
  GraphValidator,
  validators,
  rules
}
