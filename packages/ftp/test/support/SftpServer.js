
import { join, dirname } from 'path'
import fs from 'fs-extra'
import sftpFS from 'sftp-fs'
import { PermissionDeniedError } from 'sftp-fs/lib/errors.js'
import ssh2 from 'ssh2'

const __dirname = dirname(new URL(import.meta.url).pathname)

class SftpServer {
  constructor ({ path = __dirname, user, password } = {}) {
    this.port = 8020
    this.path = path
    this.user = user
    this.password = password

    this.keyFile = 'test/support/test.key'

    this.server = new sftpFS.Server(new FileSystem(this.user, this.password, this.path))
  }

  get options () {
    return {
      protocol: 'sftp',
      host: 'localhost',
      port: this.port,
      user: this.user || 'anonymous',
      password: this.password
    }
  }

  async start () {
    this.server.on('error', (error) => {
      console.error(error)
    })

    return this.server.start(this.keyFile, this.port)
  }

  async stop () {
    return this.server.stop()
  }
}

export default SftpServer

// Extend reference file system implementation to add the notion of "root directory"
class FileSystem extends sftpFS.ImplFileSystem {
  constructor (username, password, rootPath) {
    super(username, password)

    this.rootPath = rootPath
  }

  async authenticate (session, request) {
    const validMethods = ['password', 'publickey', 'none']
    const method = request.method

    if (!validMethods.includes(method)) {
      return validMethods
    }

    if (
      (method === 'none' && this.username) ||
      (method === 'password' && (
        request.username !== this.username ||
        request.password !== this.password
      ))
    ) {
      throw new PermissionDeniedError()
    }
  }

  async open (session, handle, flags, attrs) {
    const fullPath = this.getFullPath(handle.pathname)

    const id = await fs.open(fullPath, convFlags(flags), attrs.mode)

    handle.setParam('id', id)
    handle.addDisposable(async () => fs.close(id))
  }

  async stat (session, pathname) {
    const fullPath = this.getFullPath(pathname)
    return super.stat(session, fullPath)
  }

  async lstat (session, pathname) {
    const fullPath = this.getFullPath(pathname)
    return super.lstat(session, fullPath)
  }

  async listdir (session, handle) {
    const fullPath = this.getFullPath(handle.pathname)

    if (handle.getParam('eof')) {
      return
    }

    const list = []
    const files = await fs.readdir(fullPath)

    for (const filename of files) {
      const attrs = await this.lstat(session, join(handle.pathname, filename))
      const num = 1 // TODO: Number of links and directories inside this directory

      list.push({
        filename,
        longname: longname(filename, attrs, num),
        attrs
      })
    }

    handle.setParam('eof', true)

    return list
  }

  async mkdir (session, pathname, attrs) {
    const fullPath = this.getFullPath(pathname)
    return super.mkdir(session, fullPath, attrs)
  }

  async setstat (session, pathname, attrs) {
    const fullPath = this.getFullPath(pathname)
    return super.setstat(session, fullPath, attrs)
  }

  async rename (session, oldPathname, newPathname) {
    const fullOldPath = this.getFullPath(oldPathname)
    const fullNewPath = this.getFullPath(newPathname)
    await super.rename(session, fullOldPath, fullNewPath)
  }

  async rmdir (session, pathname) {
    const fullPath = this.getFullPath(pathname)
    return super.rmdir(session, fullPath)
  }

  async remove (session, pathname) {
    const fullPath = this.getFullPath(pathname)
    return super.remove(session, fullPath)
  }

  async realpath (session, pathname) {
    const fullPath = this.getFullPath(pathname)
    return super.realpath(session, fullPath)
  }

  async readlink (session, pathname) {
    const fullPath = this.getFullPath(pathname)
    return super.readlink(session, fullPath)
  }

  async symlink (session, targetPathname, linkPathname) {
    const fullTargetPath = this.getFullPath(targetPathname)
    const fullLinkPath = this.getFullPath(linkPathname)
    return super.symlink(session, fullTargetPath, fullLinkPath)
  }

  getFullPath (pathname) {
    return join(this.rootPath, pathname)
  }
}

function convFlags (flags) {
  let mode = 0

  if ((flags & ssh2.SFTP_OPEN_MODE.READ) && (flags & ssh2.SFTP_OPEN_MODE.WRITE)) {
    mode = fs.constants.O_RDWR
  } else if (flags & ssh2.SFTP_OPEN_MODE.READ) {
    mode = fs.constants.O_RDONLY
  } else if (flags & ssh2.SFTP_OPEN_MODE.WRITE) {
    mode = fs.constants.O_WRONLY
  }

  if (flags & ssh2.SFTP_OPEN_MODE.CREAT) {
    mode |= fs.constants.O_CREAT
  }

  if (flags & ssh2.SFTP_OPEN_MODE.APPEND) {
    mode |= fs.constants.O_APPEND
  }

  if (flags & ssh2.SFTP_OPEN_MODE.EXCL) {
    mode |= fs.constants.O_EXCL
  }

  if (flags & ssh2.SFTP_OPEN_MODE.TRUNC) {
    mode |= fs.constants.O_TRUNC
  }

  return mode
}

function longname (name, attrs, num) {
  let str = '-'

  if (attrs.isDirectory()) {
    str = 'd'
  } else if (attrs.isSymbolicLink()) {
    str = 'l'
  }

  str += (attrs.mode & fs.constants.S_IRUSR) ? 'r' : '-'
  str += (attrs.mode & fs.constants.S_IWUSR) ? 'w' : '-'
  str += (attrs.mode & fs.constants.S_IXUSR) ? 'x' : '-'
  str += (attrs.mode & fs.constants.S_IRGRP) ? 'r' : '-'
  str += (attrs.mode & fs.constants.S_IWGRP) ? 'w' : '-'
  str += (attrs.mode & fs.constants.S_IXGRP) ? 'x' : '-'
  str += (attrs.mode & fs.constants.S_IROTH) ? 'r' : '-'
  str += (attrs.mode & fs.constants.S_IWOTH) ? 'w' : '-'
  str += (attrs.mode & fs.constants.S_IXOTH) ? 'x' : '-'
  str += ' '
  str += num
  str += ' '
  str += attrs.uid
  str += ' '
  str += attrs.gid
  str += ' '
  str += attrs.size
  str += ' '
  str += attrs.mtime.toDateString().slice(4)
  str += ' '
  str += name

  return str
}
