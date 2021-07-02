import { obj } from 'through2'

function filter (func) {
  return obj(function (chunk, encoding, callback) {
    Promise.resolve().then(() => {
      return func(chunk, encoding)
    }).then(result => {
      if (result) {
        this.push(chunk)
      }

      callback()
    }).catch(callback)
  })
}

export default filter
