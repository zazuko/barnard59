# barnard59-validation

## 0.4.4

### Patch Changes

- [#416](https://github.com/zazuko/barnard59/pull/416) [`0f4c6f8`](https://github.com/zazuko/barnard59/commit/0f4c6f8f22182ed7d4dc04987f6bb5c08e4195c4) - Report file read and RDF parse failures as validation errors. Keep piped stdout parseable as JSON by sending human-readable diagnostics to stderr. Recognize local `file:` code links and `.js` links backed by TypeScript sources, and update the sample pipelines to use current operation exports.

- [#416](https://github.com/zazuko/barnard59/pull/416) [`0f4c6f8`](https://github.com/zazuko/barnard59/commit/0f4c6f8f22182ed7d4dc04987f6bb5c08e4195c4) - Align validation with `barnard59 run` for pipeline definitions that use `code:imports`, operation shorthand, nested pipelines, or inline JavaScript. Check nested stages using their declared stream types and treat inline JavaScript as a step with unknown stream metadata.
- Updated dependencies [[`65e2b50`](https://github.com/zazuko/barnard59/commit/65e2b50ab9fe5ad36c7f2dd4562aa62dd2ffc179), [`65e2b50`](https://github.com/zazuko/barnard59/commit/65e2b50ab9fe5ad36c7f2dd4562aa62dd2ffc179), [`65e2b50`](https://github.com/zazuko/barnard59/commit/65e2b50ab9fe5ad36c7f2dd4562aa62dd2ffc179), [`f9b9f9e`](https://github.com/zazuko/barnard59/commit/f9b9f9e23b70aa4af2254f2f308246cee0639904), [`f9b9f9e`](https://github.com/zazuko/barnard59/commit/f9b9f9e23b70aa4af2254f2f308246cee0639904), [`f9b9f9e`](https://github.com/zazuko/barnard59/commit/f9b9f9e23b70aa4af2254f2f308246cee0639904), [`f9b9f9e`](https://github.com/zazuko/barnard59/commit/f9b9f9e23b70aa4af2254f2f308246cee0639904)]:
  - barnard59@6.1.0

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
