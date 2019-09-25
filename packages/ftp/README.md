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
