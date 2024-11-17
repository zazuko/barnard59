# barnard59-core

## 6.1.1

### Patch Changes

- 10e1437: Pipeline would never finish if the last step was an async generator with a `break` statement

## 6.1.0

### Minor Changes

- 0170c58: Include the current graph in pipeline context

## 6.0.1

### Patch Changes

- 83583d2: Type annotations: remove references to `rdf-js`, using `@rdfjs/types` instead

## 6.0.0

### Major Changes

- 3caf9e4: Freeze pipeline context object to prevent accidental modifications

### Patch Changes

- d48f198: Remove usage of `rdf-js` package (deprecated)

## 5.3.3

### Patch Changes

- ce6aca4: Using anylogger caused errors when calling without a level

## 5.3.2

### Patch Changes

- e82aa36: Remove references of `rdf-js` types package, repaced with `@rdfjs/types`

## 5.3.1

### Patch Changes

- 9d0ce9f: Improve Windows compatibility (re zazuko/rdf-loader-code#34)

## 5.3.0

### Minor Changes

- ba328de: Support steps being implemented as async generators

### Patch Changes

- 70b50da: Fix: wrong `Context` type used for `Operation`
- a172b45: Relax pointer arguments
- 86131dc: `Pipeline#init` made public

## 5.2.0

### Minor Changes

- 5a70d2b: Bundle type declarations (source migrated to TypeScript)

### Patch Changes

- 5a70d2b: Updated `rdf-loaders-registry`
- 5a70d2b: Updated `rdf-loader-code`
- 5a70d2b: Replace `lodash/once` with `onetime`
- 1bfec3c: Hook default logger to `anylogger` to simplify 3rd party lib logging

## 5.1.0

### Minor Changes

- 1dbb51f: Add support for "late errors" where step authors can call `context.error()` to avoid immediately breaking the pipeline

## 5.0.0

### Major Changes

- ce0bdf4: This is breaking change for users creating and running pipeline programmatically. The `createPipeline`
  function exported by the package now requires that an RDF/JS Environment is passed as an argument.
  A compatible environment which includes all necessary factories can be imported from the new
  `barnard59-env` package.

  ```diff
  import { createPipeline, run } from 'barnard59-core'
  import env from 'barnard59-env'

  let pointer

  await run(createPipeline(pointer, {
  + env
  })
  ```

## 4.0.0

### Major Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)
- 72648c5: Change the operation URLs to be HTTPS (re zazuko/barnard59-website#4).
  This will only be a breaking change to those using the [shorthand step syntax](https://data-centric.zazuko.com/docs/workflows/explanations/simplified-syntax).

## 3.0.2

### Patch Changes

- 249b8ea: Update `is-graph-pointer` dependency

## 3.0.1

### Patch Changes

- 91b225c: Remove log message `'variables in pipeline:'` and prefix each variable logged instead

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

## 2.1.2

### Patch Changes

- a33e942: Update rdf-loader-code to ESM version

## 2.1.1

### Patch Changes

- 6d71d5d: Missing code to wire-up file loader

## 2.1.0

### Minor Changes

- 22f897d: Added a file loader for `p:FileContents` arguments (closes #31)

### Patch Changes

- b5e23e2: Update clownface to `v2`, use `@zazuko/env` instead of `rdf-ext`

## 2.0.2

### Patch Changes

- 18989fc: An empty string variable would have been treated as undefined

## 2.0.1

### Patch Changes

- 2a99cab: Sending logs to standard error so that output quads can be redirected to a file

## 2.0.0

### Major Changes

- 4ffda30: Variables are now required by default and pipeline will throw when attempting to retrieve a variable which is undefined (fixes #62)

  Pipeline authors can mark a variable `p:required false` to prevent an error from being thrown.

## 1.2.0

### Minor Changes

- ff7d6f8: Allow annotating sensitive variables in order to avoid exposing their value in the job logs (re zazuko/barnard59#66)

### Patch Changes

- ff7d6f8: Variables from sub-pipelines were not being logged
- b719456: Skip variables without `p:value`

## 1.1.6

### Patch Changes

- d1cbb01: Updated `rdf-ext` and `@rdfjs/namespace` to v2

## 1.0.0

### Added

- Loader for ECMAScript module operations (CommonJS is still supported).

### Changed

- The package is now an ECMAScript module.
  The CommonJS interface is no longer available.
- `forEach` is now part of `barnard59-base`.
- All variables are handled as RDF/JS Terms.
  Older versions used plain variable values given in a `Map` to the pipeline factory.
  Variables from the pipeline definition were already handled as RDF/JS Terms.
