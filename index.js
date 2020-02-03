const debug = require('debug')
const base = require('barnard59-base')
const core = require('barnard59-core')

const log = debug('barnard59')

module.exports = Object.assign({ log }, core, base)
