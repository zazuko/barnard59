const concat = require('./lib/concat')
const combine = require('./lib/combine')
const fetch = require('./lib/fetch')
const filter = require('./lib/filter')
const flatten = require('./lib/flatten')
const glob = require('./lib/glob')
const json = require('./lib/json')
const limit = require('./lib/limit')
const map = require('./lib/map')
const nul = require('./lib/nul')
const offset = require('./lib/offset')
const setGraph = require('./lib/setGraph')
const stdout = require('./lib/stdout')
const toString = require('./lib/toString')
const { fileToDataset, stringToDataset } = require('./lib/toDataset')

module.exports = {
  concat,
  combine,
  fetch,
  fileToDataset,
  filter,
  flatten,
  glob,
  json,
  limit,
  map,
  nul,
  offset,
  setGraph,
  stdout,
  stringToDataset,
  toString
}
