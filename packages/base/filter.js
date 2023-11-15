import { obj } from 'through2'

function filter(func) {
  return obj((chunk, encoding, callback) => {
    Promise.resolve().then(() => {
      return func.call(this, chunk, encoding)
    }).then(result => {
      if (result) {
        return callback(null, chunk)
      }

      return callback()
    }).catch(callback)
  })
}

export default filter
