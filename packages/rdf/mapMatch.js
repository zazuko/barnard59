const rdf = require('rdf-ext')
const { Transform } = require('readable-stream')
const PatternMatcher = require('./lib/PatternMatcher')

function mapMatch ({ map, subject, predicate, object, graph }) {
  const matcher = new PatternMatcher({ subject, predicate, object, graph })

  return new Transform({
    objectMode: true,
    transform: async (quad, encoding, callback) => {
      // these are not the quads you're looking for
      if (!matcher.test(quad)) {
        return callback(null, quad)
      }

      try {
        callback(null, await map.call({ rdf }, quad))
      } catch (err) {
        callback(err)
      }
    }
  })
}

module.exports = mapMatch
