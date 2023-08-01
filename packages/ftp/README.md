# barnard59-ftp

[![Build Status](https://travis-ci.org/zazuko/barnard59-ftp.svg?branch=master)](https://travis-ci.org/zazuko/barnard59-ftp)

FTP support for Linked Data pipelines.

## Examples

### list

The pipeline defined in `examples/list.ttl` lists all files in the root directory of the FTP server running on `localhost` port 8020 using the user/password `test/1234`.
To run a server with that configuration, just use the following command:

```bash
node examples/server.js
```

The pipeline can be started like this:

```bash
./node_modules/.bin/barnard59 run --format=text/turtle --pipeline=http://example.org/pipeline#pipeline --verbose examples/list.ttl
```

## Operations

This package provides operations to make single requests to an FTP server. The
following options are common to all the operations.

Common options:
- `protocol` (*string*): "ftp" (default) or "sftp"
- `host` (*string*): Hostname or IP address of the server (default "localhost")
- `port` (*integer*): Port number of the server (default 21 for FTP, 22 for SFTP)
- `user` (*string*): Username for authentication
- `password` (*string*): Password for password-based authentication
- `privateKey` (*mixed*): (SFTP-only) Buffer or string that contains a private
  key for either key-based or hostbased user authentication (OpenSSH format).
- `passphrase` (*string*): (SFTP-only) For an encrypted private key, this is
  the passphrase used to decrypt it.

### list

List files in a given remote directory. Returns a stream of file names.

Options:
- `pathname` (*string*): Path of the directory to list
- All the common options defined above

### read

Read the content of a remote file at a given path. Returns a stream of
string data.

Options:
- `filename` (*string*): Path of the file to read
- All the common options defined above

### move

Move a remote file from one path to another.

Options:
- `source` (*string*): Source path
- `target` (*string*): Target path
- All the common options defined above
