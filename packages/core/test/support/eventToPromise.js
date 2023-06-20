function eventToPromise(obj, event) {
  return new Promise(resolve => {
    obj.on(event, resolve)
  })
}

export default eventToPromise
