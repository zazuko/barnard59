# barnard59-graph-store

## 8.0.0

### Major Changes

- [#416](https://github.com/zazuko/barnard59/pull/416) [`f46db0c`](https://github.com/zazuko/barnard59/commit/f46db0ce4c7c2224034e935ea1b0815ce73c761a) - The `barnard59 graph-store put` command now requires an explicit `--graph` target. Pass `--graph DEFAULT` to write to the default graph.

- [#416](https://github.com/zazuko/barnard59/pull/416) [`f46db0c`](https://github.com/zazuko/barnard59/commit/f46db0ce4c7c2224034e935ea1b0815ce73c761a) - By default, Graph Store `put` now fails when the input contains no RDF quads. To keep skipping empty uploads successfully, pass `--allow-empty` in the CLI or set `allowEmpty: true` in JavaScript or a pipeline step.

### Minor Changes

- [#416](https://github.com/zazuko/barnard59/pull/416) [`f46db0c`](https://github.com/zazuko/barnard59/commit/f46db0ce4c7c2224034e935ea1b0815ce73c761a) - Added `--allow-clear` option to clear the target graph with an empty PUT when the input contains no RDF quads. This takes precedence over `--allow-empty`. In JavaScript and pipeline steps, set `allowClear: true`.

### Patch Changes

- [#416](https://github.com/zazuko/barnard59/pull/416) [`f46db0c`](https://github.com/zazuko/barnard59/commit/f46db0ce4c7c2224034e935ea1b0815ce73c761a) - Mask the Graph Store upload password in CLI pipeline logs.

- [#416](https://github.com/zazuko/barnard59/pull/416) [`f46db0c`](https://github.com/zazuko/barnard59/commit/f46db0ce4c7c2224034e935ea1b0815ce73c761a) - Ignore directories matched by the Graph Store `put` command's `--source` glob so only files are passed to the RDF parser.

- [#416](https://github.com/zazuko/barnard59/pull/416) [`f9b9f9e`](https://github.com/zazuko/barnard59/commit/f9b9f9e23b70aa4af2254f2f308246cee0639904) - Add the `barnard59-graph-store` skill for reading, appending to, and replacing RDF graphs through the SPARQL Graph Store Protocol.
- Updated dependencies [[`e12fa2b`](https://github.com/zazuko/barnard59/commit/e12fa2bba0d1c7385473b2a33a54ff1590bdf85a), [`2228ea1`](https://github.com/zazuko/barnard59/commit/2228ea1790ac6b988c6dbcfba4fd4f38e1c6e486), [`f9b9f9e`](https://github.com/zazuko/barnard59/commit/f9b9f9e23b70aa4af2254f2f308246cee0639904), [`f9b9f9e`](https://github.com/zazuko/barnard59/commit/f9b9f9e23b70aa4af2254f2f308246cee0639904)]:
  - barnard59-base@3.1.0
  - barnard59-rdf@4.0.2

## 7.0.1

### Patch Changes

- [#408](https://github.com/zazuko/barnard59/pull/408) [`2359425`](https://github.com/zazuko/barnard59/commit/23594250599bbde63503ae8c0895405df669c922) Thanks [@tpluscode](https://github.com/tpluscode)! - Set the required node version to `>=14.13.1` in `engines`
- Updated dependencies [[`2359425`](https://github.com/zazuko/barnard59/commit/23594250599bbde63503ae8c0895405df669c922), [`2359425`](https://github.com/zazuko/barnard59/commit/23594250599bbde63503ae8c0895405df669c922)]:
  - barnard59-base@3.0.1
  - barnard59-rdf@4.0.1

## 7.0.0

### Major Changes

- [#399](https://github.com/zazuko/barnard59/pull/399) [`e5b0100`](https://github.com/zazuko/barnard59/commit/e5b01008eefe180859da3dc940fdb1b90a866abe) Thanks [@tpluscode](https://github.com/tpluscode)! - Removed `readable-stream` and replaced all usages with `node:stream`

### Patch Changes

- Updated dependencies [[`6a7c8af`](https://github.com/zazuko/barnard59/commit/6a7c8afbbc5889c581db05d1654e38f75e914218), [`e5b0100`](https://github.com/zazuko/barnard59/commit/e5b01008eefe180859da3dc940fdb1b90a866abe)]:
  - barnard59-base@3.0.0
  - barnard59-rdf@4.0.0

## 6.0.4

### Patch Changes

- 713def9: Remove mention of unused `maxQuadsPerRequest` option from the readme
- Updated dependencies [2e75bf3]
- Updated dependencies [bda7bf9]
  - barnard59-base@2.5.1

## 6.0.3

### Patch Changes

- 4de8909: Update `rdf-literal` to v2
- Updated dependencies [4de8909]
  - barnard59-rdf@3.4.1

## 6.0.2

### Patch Changes

- 9cad30b: Updated onetime to v7

## 6.0.1

### Patch Changes

- 83583d2: Type annotations: remove references to `rdf-js`, using `@rdfjs/types` instead

## 6.0.0

### Major Changes

- f240b0f: Updated `sparql-http-client` to v3
  Removed `maxQuadsPerRequest` from PUT and POST operations

### Patch Changes

- Updated dependencies [f6d593c]
  - barnard59-base@2.4.2

## 5.1.2

### Patch Changes

- d48f198: Remove usage of `rdf-js` package (deprecated)
- Updated dependencies [d48f198]
- Updated dependencies [94551a4]
  - barnard59-base@2.4.1

## 5.1.1

### Patch Changes

- e82aa36: Remove references of `rdf-js` types package, repaced with `@rdfjs/types`

## 5.1.0

### Minor Changes

- 4d7b620: Bundle TypeScript declarations

### Patch Changes

- Updated dependencies [0c0245d]
- Updated dependencies [464b09e]
- Updated dependencies [ba328de]
  - barnard59-base@2.3.0

## 5.0.0

### Major Changes

- ade9d1f: Disable stream splitting by default, add optional argument to `put` pipeline
- b82b47b: Align operation URIs with the other packages

  ```diff
  -prefix graph-store: <https://barnard59.zazuko.com/operation/graph-store/>
  +prefix graph-store: <https://barnard59.zazuko.com/operations/graph-store/>
  ```

## 4.0.0

### Patch Changes

- Updated dependencies [68c034a]
  - barnard59-rdf@3.0.0

## 3.0.0

### Patch Changes

- Updated dependencies [5327ff0]
  - barnard59-base@2.1.0

## 2.1.0

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

### Patch Changes

- Updated dependencies [67504df]
  - barnard59-base@2.0.1

## 2.0.0

### Major Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)
- 72648c5: Change the operation URLs to be HTTPS (re zazuko/barnard59-website#4).
  This will only be a breaking change to those using the [shorthand step syntax](https://data-centric.zazuko.com/docs/workflows/explanations/simplified-syntax).

### Patch Changes

- Updated dependencies [64b50ac]
- Updated dependencies [6be7cd8]
- Updated dependencies [72648c5]
  - barnard59-base@2.0.0
  - barnard59-rdf@2.0.0

## 1.1.1

### Patch Changes

- f0814d5: Operations in manifest had wrong types
- Updated dependencies [f0814d5]
  - barnard59-base@1.2.2
  - barnard59-rdf@1.4.3

## 1.1.0

### Minor Changes

- 03fd12a: Added a reusable `put` pipeline

## 1.0.2

### Patch Changes

- fd2353f: Updated `@rdfjs/data-model` to v2

- Moved to JavaScript modules
