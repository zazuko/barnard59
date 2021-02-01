const validators = require('./validators')

// { [ruleId]: validator }
const rulesById = Object.values(validators)
  .reduce((acc, rule) => {
    acc[rule.ruleId] = rule
    return acc
  }, {})

const rules = Object.values(validators).map((validator) => validator.describeRule())

module.exports = {
  rules,
  rulesById
}
