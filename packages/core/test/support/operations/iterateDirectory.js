const stream = require('readable-stream')
const fs = require('fs')
const path = require('path')

class FileIterator extends stream.Readable {
  constructor (dirName, base) {
    super({
      objectMode: true,
      read: () => {}
    })

    const directory = path.resolve(base, dirName)
    fs.readdir(directory, (e, files) => {
      files.forEach(file => {
        this.push(path.resolve(directory, file))
      })

      this.push(null)
    })
  }
}

function iterateFiles (dirName) {
  return new FileIterator(dirName, this.pipeline.basePath)
}

module.exports = iterateFiles
