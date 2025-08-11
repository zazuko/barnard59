# barnard59-validation

## 0.4.3

### Patch Changes

- 4de8909: Update `rdf-loader-code` to v2.2.2
- Updated dependencies [4de8909]
  - barnard59-env@1.2.7

## 0.4.2

### Patch Changes

- 9d0ce9f: Improve Windows compatibility (re zazuko/rdf-loader-code#34)
- Updated dependencies [c090ff2]
- Updated dependencies [82dbe7e]
  - barnard59-env@1.2.2

## 0.4.1

### Patch Changes

- 898c80f: Use `barnard59-env` instead of `@zazuko/env(-node)`.

  Remove direct dependency on `@rdfjs/formats-common`

- 5a70d2b: Updated `rdf-loader-code`
- Updated dependencies [5a70d2b]
- Updated dependencies [5a70d2b]
  - barnard59-env@1.2.0

## 0.4.0

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

## 0.3.0

### Minor Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)

* Add an experimental `manifest.ttl` checker: `barnard59-validate -m manifest.ttl -v`

# `v0.1.1`

- Properly report "file not found" when trying to run the tool on a file that does not exist
- Look for pipeline dependencies relative to CLI current working directory

# `v0.1.0`

Initial release
