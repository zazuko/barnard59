# Changelog

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
