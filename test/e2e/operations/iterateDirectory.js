import { readdir } from 'fs'
import { resolve } from 'path'
import stream from 'readable-stream'

const { Readable } = stream

class FileIterator extends Readable {
  constructor(dirName, basePath) {
    super({
      objectMode: true,
      read: () => {},
    })

    const directory = resolve(basePath, dirName)

    readdir(directory, (e, files) => {
      if (e) {
        this.emit('error', e)
        return
      }

      files.forEach(file => {
        this.push(resolve(directory, file))
      })

      this.push(null)
    })
  }
}

function factory(dirName) {
  return new FileIterator(dirName, this.basePath)
}

export default factory
