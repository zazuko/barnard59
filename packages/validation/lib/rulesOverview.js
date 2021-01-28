const { CodelinkValidator } = require('./rules/codelinkValidator')

const validators = [
  CodelinkValidator
]

const rules = validators.map((cls) => cls.describeRule())

module.exports = {
  validators,
  rules
}
