const validators = require('./validators')
const rules = []

for (const validator of Object.keys(validators)) {
  if (validator !== 'index') {
    rules.push(validators[[validator]].describeRule())
  }
}

module.exports = rules
