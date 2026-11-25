# barnard59-ftp

## 3.0.1

### Patch Changes

- [#416](https://github.com/zazuko/barnard59/pull/416) [`f9b9f9e`](https://github.com/zazuko/barnard59/commit/f9b9f9e23b70aa4af2254f2f308246cee0639904) - Add the `barnard59-ftp` skill for listing, reading, writing, and moving files over FTP or SFTP.

## 3.0.0

### Major Changes

- [#399](https://github.com/zazuko/barnard59/pull/399) [`e5b0100`](https://github.com/zazuko/barnard59/commit/e5b01008eefe180859da3dc940fdb1b90a866abe) Thanks [@tpluscode](https://github.com/tpluscode)! - Removed `readable-stream` and replaced all usages with `node:stream`

### Patch Changes

- [#403](https://github.com/zazuko/barnard59/pull/403) [`62c185a`](https://github.com/zazuko/barnard59/commit/62c185a1610a69b46350c52c3788210e3cf50d70) Thanks [@tpluscode](https://github.com/tpluscode)! - Fixes a bug where SFTP connection would be prematurely closed

## 2.2.0

### Minor Changes

- 4a8cac8: Update `ssh2-sftp-client` to v12 - fixes usage in node 24

## 2.1.0

### Minor Changes

- e518854: Added `write` operation

### Patch Changes

- bc717f6: Fix accidental breaking change when importing `readable-stream`

## 2.0.0

### Major Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)
- 72648c5: Change the operation URLs to be HTTPS (re zazuko/barnard59-website#4).
  This will only be a breaking change to those using the [shorthand step syntax](https://data-centric.zazuko.com/docs/workflows/explanations/simplified-syntax).

## 1.0.3

### Patch Changes

- f0814d5: Operations in manifest had wrong types

## 1.0.2

### Patch Changes

- 176d393: Updated `sftp-promises` to v1.8

- Moved to JavaScript modules
