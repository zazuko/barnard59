// eslint-disable-next-line import-x/no-extraneous-dependencies, n/no-unpublished-require -- This example uses the shell package from the CLI's dev dependencies.
const shell = require('barnard59-shell')

module.exports = function sed(search, replace) {
  return shell('sed', '-e', `s/${search}/${replace}/g`)
}
