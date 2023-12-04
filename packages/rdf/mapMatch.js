import rdf from 'barnard59-env'
import { Transform } from 'readable-stream'
import PatternMatcher from './lib/PatternMatcher.js'

function mapMatch({ map, subject, predicate, object, graph }) {
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
    },
  })
}

export default mapMatch
