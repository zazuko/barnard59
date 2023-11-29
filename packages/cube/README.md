# barnard59-cube

This package provides operations and commands for RDF cubes in Barnard59 Linked Data pipelines.
The `manifest.ttl` file contains a full list of all operations included in this package. 

## Installation

```
npm i barnard59-cube
```

## Operations

### `cube/buildCubeShape`

TBD

### `cube/toObservation`

TBD


## Commands

Peer dependencies must be explicitly installed

```
npm i barnard59-base barnard59-formats barnard59-http barnard59-rdf barnard59-sparql barnard59-shacl
```

## Cube validation

The following pipelines retrieve and validate cube observations and metadata.

### fetch metadata

Pipeline `fetch-metadata` queries a given SPARQL endpoint to retrieve 
a [concise bounded description](https://docs.stardog.com/query-stardog/#describe-queries) of a given cube and its constraint (excluding the observations).

```bash
npx barnard59 cube fetch-metadata \
  --cube https://agriculture.ld.admin.ch/agroscope/PRIFm8t15/2 \
  --endpoint https://int.lindas.admin.ch/query
```


This pipeline is useful mainly for cubes published with [cube creator](https://github.com/zazuko/cube-creator) (if the cube definition is manually crafted, likely it's already available as a local file).


### check metadata

Pipeline `check-metadata` validates the input metadata against the shapes provided with the `profile` variable (the default profile is https://cube.link/latest/shape/standalone-constraint-constraint).

The pipeline reads the metadata from `stdin`, allowing input from a local file (as in the following example) as well as from the output of the `fetch-metadata` pipeline (in most cases it's useful to have the metadata in a local file because it's needed also for the `check-observations` pipeline).

```bash
cat cube.ttl \
| npx barnard59 cube check-metadata \
    --profile https://cube.link/v0.1.0/shape/standalone-constraint-constraint
```
SHACL reports for violations are written to `stdout`.

In cases when a remote address give to `--profile` option does not include a correct `content-type` header (or does not provide a `content-type` header at all), the pipeline will fail. In such cases, it is possible to use the `--profileFormat` option to select the correct RDF parser. Its value must be a media type, such as `text/turtle`.

```bash

### fetch observations

Pipeline `fetch-observations` queries a given SPARQL endpoint to retrieve the observations of a given cube.

```bash
npx barnard59 cube fetch-observations \
    --cube https://agriculture.ld.admin.ch/agroscope/PRIFm8t15/2 \
    --endpoint https://int.lindas.admin.ch/query
```
Results are written to `stdout`.

### check observations

Pipeline `check-observations` validates the input observations against the shapes provided with the `constraint` variable.

The pipeline reads the observations from `stdin`, allowing input from a local file (as in the following example) as well as from the output of the `fetch-observations` pipeline.

```bash
cat observations.ttl \
| npx barnard59 cube check-observations \
    --constraint metadata.ttl
```

To enable validation, the pipeline adds to the constraint a `sh:targetClass` property with value `cube:Observation`, requiring that each observation has an explicit `rdf:type`.

To leverage streaming, input is split and validated in little batches of adjustable size (the default is 50 and likely it's appropriate in most cases). This allows the validation of very big cubes because observations are not loaded in memory all at once. To ensure triples for the same observation are adjacent (hence processed in the same batch), the input is sorted by subject (and in case the input is large the sorting step relies on temporary local files).

SHACL reports for violations are written to `stdout`.

To limit the output size, there is also a `maxViolations` option to stop validation when the given number of violations is reached.

### Known issues

Command `check-metadata` may fail if there are `sh:in` constraints with too many values.
