function createDummyPipeline ({
  readable = false,
  writable = false,
  init = () => true,
  read = () => {},
  write = () => {},
  destroy = (err, callback) => callback(err)
} = {}) {
  return {
    readable,
    writable,
    init,
    read,
    write,
    destroy
  }
}

module.exports = createDummyPipeline
