# barnard59-sparql

## 2.0.0

### Major Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)
- 72648c5: Change the operation URLs to be HTTPS (re zazuko/barnard59-website#4).
  This will only be a breaking change to those using the [shorthand step syntax](https://data-centric.zazuko.com/docs/workflows/explanations/simplified-syntax).

## 1.1.2

### Patch Changes

- f0814d5: Operations in manifest had wrong types

## 1.1.1

### Patch Changes

- b5e23e2: Update clownface to `v2`, use `@zazuko/env` instead of `rdf-ext`

## 1.1.0

### Minor Changes

- eeca6e9: Added the possibility to send queries with POST by providing `operation` argument

### Patch Changes

- a56ba95: Update RDF/JS dependencies to ESM
