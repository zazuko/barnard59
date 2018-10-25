function eventToPromise (obj, event) {
  const promise = new Promise((resolve) => {
    obj.on(event, resolve)
  })

  // attach .reject function to Promise
  promise.reject = () => {
    return promise.then((err) => {
      return Promise.reject(err || new Error())
    })
  }

  return promise
}

module.exports = eventToPromise
