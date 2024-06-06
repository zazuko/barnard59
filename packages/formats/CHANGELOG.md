# barnard59-formats

## 2.1.2

### Patch Changes

- cd81cc1: Added type declarations
- 6fea1cc: Context was unbound in step `jsonld/parse/object`
- 1df0b79: Ensures that the RDF/JS environment is used with parser streams

## 2.1.1

### Patch Changes

- 57bb930: Ensures that the RDF/JS environment is used with parser streams

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

## 1.4.2

### Patch Changes

- f0814d5: Operations in manifest had wrong types
- Updated dependencies [f0814d5]
  - barnard59-base@1.2.2

## 1.4.1

### Patch Changes

- 93b33d0: The package would use `rdf-ext` but it was not a dependency. Using `@zazuko/env` instead

## 1.4.0

### Minor Changes

- f09e8b0: Forward n3 step options to parser (closes #24). For example, to parse n3 rules

  ```turtle
  [
    a :Step ;
    code:implementedBy
      [
        a code:EcmaScriptModule ;
        code:link <node:barnard59-formats/n3.js#parse>
      ] ;
    code:arguments
      [
        code:name "format" ;
        code:value "text/n3" ;
      ] ;
  ]
  ```

## 1.3.1

### Patch Changes

- 59d713f: Updated RDF/JS packages to v2
- 396d36e: Correct rdf/xml usage in manifest (closes #20)

- Moved to JavaScript modules
