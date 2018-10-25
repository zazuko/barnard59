const combine = require('barnard59-base').combine
const sinkToDuplex = require('./sinkToDuplex')
const stringify = require('barnard59-base').json.stringify
const Parser = require('@rdfjs/parser-jsonld')
const Serializer = require('@rdfjs/serializer-jsonld')

function parse () {
  return sinkToDuplex(new Parser(), { objectMode: true })
}

parse.object = () => {
  return combine([stringify(), parse()], { objectMode: true })
}

function serialize () {
  return sinkToDuplex(new Serializer(), { objectMode: true })
}

module.exports = {
  parse,
  serialize
}
