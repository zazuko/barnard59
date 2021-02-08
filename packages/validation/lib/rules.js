const validators = require('./validators')

// { [ruleId]: validator }
const rulesById = Object.values(validators)
  .reduce((acc, rule) => {
    acc[rule.ruleId] = rule
    return acc
  }, {})

const rules = Object.values(validators)
  .map((validator) => validator.describeRule())
  .sort(({ ruleId: a }, { ruleId: b }) => a - b)

if (require.main === module) {
  console.log(JSON.stringify(rules, null, 2))
}

module.exports = {
  rules,
  rulesById
}
