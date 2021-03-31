import stream from 'readable-stream'
import fs from 'fs'

class FileIterator extends stream.Readable {
  constructor (dirName) {
    super({
      objectMode: true,
      read: () => {},
    })

    fs.readdir(dirName, (e, files) => {
      files.forEach(file => {
        this.push(file)
      })

      this.push(null)
    })
  }
}

export function iterateFiles (dirName) {
  return new FileIterator(dirName)
}
