# barnard59

## 5.0.6

### Patch Changes

- Updated dependencies [10e1437]
  - barnard59-core@6.1.1

## 5.0.5

### Patch Changes

- Updated dependencies [0170c58]
  - barnard59-core@6.1.0

## 5.0.4

### Patch Changes

- b86a9ab: Suggest package to install when a CLI command is not found
- 83583d2: Type annotations: remove references to `rdf-js`, using `@rdfjs/types` instead
- Updated dependencies [83583d2]
  - barnard59-core@6.0.1

## 5.0.3

### Patch Changes

- Updated dependencies [1df0b79]
  - barnard59-env@1.2.6

## 5.0.2

### Patch Changes

- Updated dependencies [57bb930]
  - barnard59-env@1.2.5

## 5.0.1

### Patch Changes

- Updated dependencies [287efab]
  - barnard59-env@1.2.4

## 5.0.0

### Major Changes

- 3caf9e4: Freeze pipeline context object to prevent accidental modifications

### Patch Changes

- d48f198: Remove usage of `rdf-js` package (deprecated)
- Updated dependencies [d48f198]
- Updated dependencies [3caf9e4]
  - barnard59-core@6.0.0

## 4.5.3

### Patch Changes

- Updated dependencies [ce6aca4]
  - barnard59-core@5.3.3

## 4.5.2

### Patch Changes

- e82aa36: Remove references of `rdf-js` types package, repaced with `@rdfjs/types`
- Updated dependencies [e82aa36]
  - barnard59-core@5.3.2

## 4.5.1

### Patch Changes

- Updated dependencies [9178b7e]
  - barnard59-env@1.2.3

## 4.5.0

### Minor Changes

- 68dff05: Support [`code:imports`](https://github.com/zazuko/rdf-transform-graph-imports) when loading pipeline definitions (closes #93)

### Patch Changes

- 9d0ce9f: Improve Windows compatibility (re zazuko/rdf-loader-code#34)
- Updated dependencies [9d0ce9f]
- Updated dependencies [c090ff2]
- Updated dependencies [82dbe7e]
  - barnard59-core@5.3.1
  - barnard59-env@1.2.2

## 4.4.0

### Minor Changes

- 86131dc: Bundle TypeScript type declarations

### Patch Changes

- a172b45: Warn when a CLI pipeline command is incomplete
- Updated dependencies [86131dc]
- Updated dependencies [ba328de]
- Updated dependencies [70b50da]
- Updated dependencies [a172b45]
- Updated dependencies [86131dc]
  - barnard59-env@1.2.1
  - barnard59-core@5.3.0

## 4.3.2

### Patch Changes

- ae574b8: Steps using simplified syntax would not be found when running a globally installed pipeline command

## 4.3.1

### Patch Changes

- 89fa4fb: Fix: running from global installation did not work

## 4.3.0

### Minor Changes

- e7b1cc1: Adds the ability to run b59 extension commands from global installation (NPM-only)

### Patch Changes

- 6019be1: Packages which provide CLI command are now be discoverable from `node_modules` without the need to install explicitly in project
- Updated dependencies [5a70d2b]
- Updated dependencies [5a70d2b]
- Updated dependencies [5a70d2b]
- Updated dependencies [5a70d2b]
- Updated dependencies [1bfec3c]
- Updated dependencies [5a70d2b]
  - barnard59-env@1.2.0
  - barnard59-core@5.2.0

## 4.2.0

### Minor Changes

- b7ef314: Added a CLI alias `b59` to reduce the typing necessary

### Patch Changes

- 2eda6da: `--variable` option should have precedence over environments variables imported with `--variable-all` (closes #74)

## 4.1.1

### Patch Changes

- bb3b99b: include peer dependencies in manifest discovery
- Updated dependencies [1dbb51f]
- Updated dependencies [e0bab1a]
  - barnard59-core@5.1.0
  - barnard59-env@1.1.0

## 4.1.0

### Minor Changes

- ce0bdf4: Removed dependency on any RDF/JS Environment. The CLI provides it at runtime to ensure that steps
  use the same factories. Step implementors are encouraged to use the environment provided by the
  barnard59 runtime insead of importing directly.

  ```diff
  -import rdf from 'rdf-ext'

  export function myStep() {
  - const dataset = rdf.dataset()
  + const dataset = this.env.dataset()

    return rdf.dataset().toStream()
  }
  ```

- 5c526f2: Include current project in manifest discovery

### Patch Changes

- 0e5cb97: Write CLI errors to `stderr`
- Updated dependencies [ce0bdf4]
- Updated dependencies [ce0bdf4]
  - barnard59-core@5.0.0
  - barnard59-env@1.0.0

## 4.0.0

### Major Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)

### Patch Changes

- Updated dependencies [6be7cd8]
- Updated dependencies [72648c5]
  - barnard59-core@4.0.0

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
