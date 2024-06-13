# barnard59-csvw

## 2.2.1

### Patch Changes

- d3927ba: `manifest.json` was inadvertently removed from v2.2
- 69fe472: Context would never be loaded because of error in condition

## 2.2.0

### Minor Changes

- 5867c79: Added type declarations
- d8bdf29: The package now includes a copy of the CSVW context to avoid rate limiting issues when frequently loading the context from the web. To force using the remote context, pass `useRemoteCsvwContext: true` to the `fetch` step options.

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

## 2.0.0

### Major Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)
- 72648c5: Change the operation URLs to be HTTPS (re zazuko/barnard59-website#4).
  This will only be a breaking change to those using the [shorthand step syntax](https://data-centric.zazuko.com/docs/workflows/explanations/simplified-syntax).

## 1.0.2

### Patch Changes

- 0c07f01: Updated `@rdfjs/fetch` to v3

## 1.0.1

### Patch Changes

- 93a11f5: Added module with a commonly used CSVW filter
