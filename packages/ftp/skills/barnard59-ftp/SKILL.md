---
name: barnard59-ftp
description: Use when listing, reading, writing, or moving files over FTP or SFTP in a Barnard59 pipeline.
---

# FTP and SFTP steps

With `@prefix op: <https://barnard59.zazuko.com/operations/> .`, use predicates such as `op:ftp\/list`. Pass the connection settings in the same named options object as the operation arguments. Set `protocol` to `ftp` (default) or `sftp` and supply `host`, `port`, and `user` as needed. Use `password` or, for SFTP, `privateKey` and optional `passphrase`. The private key can be key contents or a local path. Supply credentials through runtime variables.

## `list`

`<node:barnard59-ftp/list.js#default>` takes named `pathname`. It lists regular files in that remote directory and emits one path string per object-mode chunk. Connect it to `barnard59-base`'s `forEach` and bind the path to the nested pipeline's `filename` variable to process each file.

## `read`

`<node:barnard59-ftp/read.js#default>` takes named `filename` for the remote path and emits the file's bytes. Use it as the first step in a per-file pipeline and connect it to a parser or a local file writer. The connection stays open until the read stream closes.

## `write`

`<node:barnard59-ftp/write.js#default>` takes named `filename` for the destination on the server. Use it as a byte sink after a file reader or serializer. It writes the upstream data to the remote file and closes the connection when the stream finishes.

## `move`

`<node:barnard59-ftp/move.js#default>` takes named `source` and `target` paths. It forwards chunks unchanged and renames the remote file when its transform flushes. The implementation runs in object mode. For archiving, arrange the per-file workflow so this step reaches its flush after the processing or transfer that must succeed first.
