const stream = require('readable-stream')
const fs = require('fs')
const path = require('path')

class FileIterator extends stream.Readable {
  constructor (dirName, base, log) {
    super({
      objectMode: true,
      read: () => {}
    })

    log.debug(`will iterate ${dirName}`)

    const directory = path.resolve(base, dirName)
    fs.readdir(directory, (e, files) => {
      files.forEach(file => {
        log.debug(`pushing file ${file}`)
        this.push(path.resolve(directory, file))
      })

      this.push(null)
    })
  }
}

function iterateFiles (dirName) {
  return new FileIterator(dirName, this.pipeline.basePath, this.log)
}

module.exports = iterateFiles
