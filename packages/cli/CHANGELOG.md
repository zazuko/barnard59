# Changelog

## 3.0.2

### Patch Changes

- a0935df: Improve error output when multiple pipelines are found (fixes #160)
- ddcbd04: Introduce a simpler syntax for pipeline steps (resolves #131)
- Updated dependencies [249b8ea]
  - barnard59-core@3.0.2

## 3.0.1

### Patch Changes

- Updated dependencies [91b225c]
  - barnard59-core@3.0.1

## 3.0.0

### Major Changes

- 028126d: Improve logging

  1. Added `trace` and `verbose` levels
  2. Log pipeline debug info as `trace` (closes #149)
  3. Change the semantics of CLI `--verbose` flag
     - default level (without flag) is `warn`
     - `-v` -> `info`
     - `-vv` -> `debug`
     - `-vvv` -> `verbose`
     - `-vvvv` -> `trace`
  4. Added new `--quiet` flag to disable all logging
  5. Pipeline variables are logged to `verbose`

### Patch Changes

- ccc06d0: Enable TRACE logging level
- Updated dependencies [028126d]
  - barnard59-core@3.0.0

## 2.0.0

### Major Changes

- ec47a51: Monitoring flags moved before commands:

  - `--enable-buffer-monitor`
  - `--otel-debug`
  - `--otel-metrics-exporter`
  - `--otel-metrics-interval`
  - `--otel-traces-exporter`

  Update scripts like

  ```diff
  -barnard59 run pipeline.ttl --enable-buffer-monitor
  +barnard59 --enable-buffer-monitor run pipeline.ttl
  ```

### Minor Changes

- ec47a51: Common CLI flags are now support both when before and after the `run` command.

  For example, these two commands are now equivalent:

  ```shell
  barnard59 run file.ttl --verbose
  barnard59 --verbose run file.ttl
  ```

- 03fd12a: The CLI will now discover new commands from other `barnard59-*` packages (re #85)

  See [here](https://data-centric.zazuko.com/docs/workflows/how-to/extend-banard59-cli) for more details

### Patch Changes

- 9bdcb64: Enable TRACE logging level

## 1.1.7

### Patch Changes

- Updated dependencies [a33e942]
  - barnard59-core@2.1.2

## 1.1.6

### Patch Changes

- Updated dependencies [6d71d5d]
  - barnard59-core@2.1.1

## 1.1.5

### Patch Changes

- b5e23e2: Update clownface to `v2`, use `@zazuko/env` instead of `rdf-ext`
- Updated dependencies [b5e23e2]
- Updated dependencies [22f897d]
  - barnard59-core@2.1.0

## 1.1.4

### Patch Changes

- 9038f09: Range of `barnard59-core` is now `1 - 2` because v2 includes a potential breaking change where variables with undefined values will cause pipelines to fail. Consumers can lock the version `barnard59-core` to `^1` in order to avoid fixing the pipeline right away
- 9038f09: Logging of pipeline variables was moved to core library (closes #66 closes #70)

## 1.1.3

### Patch Changes

- 783343a: Updated `barnard59-core` to v1.1.6
- 783343a: Update `rdf-ext` to v2

## 1.0.0

### Changed

- Removed `--format` argument.
  The file extension is now used to detect the format.
