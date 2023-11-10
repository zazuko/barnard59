# barnard59-cube

This package provides operations and commands for RDF cubes in Barnard59 Linked Data pipelines.
The `manifest.ttl` file contains a full list of all operations included in this package. 

## Operations

### `cube/buildCubeShape`

TBD

### `cube/toObservation`

TBD


## Commands

## Cube validation

`cube-validation.ttl` contains pipelines to retrieve and validate cube observations and their constraints.

### fetch cube constraint

Pipeline `fetch-cube-constraint` queries a given SPARQL endpoint (default is https://lindas.admin.ch/query) to retrieve 
a [concise bounded description](https://docs.stardog.com/query-stardog/#describe-queries) of the `cube:Constraint` part of a given cube.

```bash
npx barnard59 run ./pipeline/cube-validation.ttl \
    --pipeline http://barnard59.zazuko.com/pipeline/cube-validation/fetch-cube-constraint \
    --variable cube=https://agriculture.ld.admin.ch/agroscope/PRIFm8t15/2 \
    --variable endpoint=https://int.lindas.admin.ch/query 
```

Taking advantage of [package-specific commands](https://data-centric.zazuko.com/docs/workflows/reference/cli/#package-specific-commands), we can express the same as:

```bash
npx barnard59 cube fetch-constraint \
  --cube https://agriculture.ld.admin.ch/agroscope/PRIFm8t15/2 \
  --endpoint https://int.lindas.admin.ch/query
```


This pipeline is useful mainly for cubes published with [cube creator](https://github.com/zazuko/cube-creator) (if the cube definition is manually crafted, likely it's already available as a local file).


### check cube constraint

Pipeline `check-cube-constraint` validates the input constraint against the shapes provided with the `profile` variable (the default profile is https://cube.link/latest/shape/standalone-constraint-constraint).

The pipeline reads the constraint from `stdin`, allowing input from a local file (as in the following example) as well as from the output of the `fetch-cube-constraint` pipeline (in most cases it's useful to have the constraint in a local file because it's needed also for the `check-cube-observations` pipeline).

```bash
cat myConstraint.ttl \
| npx barnard59 cube check-constraint \
    --profile https://cube.link/v0.1.0/shape/standalone-constraint-constraint
```
SHACL reports for violations are written to `stdout`.


### fetch cube observations

Pipeline `fetch-cube-observations` queries a given SPARQL endpoint (default is https://lindas.admin.ch/query) to retrieve the observations of a given cube.

```bash
npx barnard59 cube fetch-observations \
    --cube https://agriculture.ld.admin.ch/agroscope/PRIFm8t15/2 \
    --endpoint https://int.lindas.admin.ch/query
```
Results are written to `stdout`.

### check cube observations

Pipeline `check-cube-observations` validates the input observations against the shapes provided with the `constraint` variable.

The pipeline reads the observations from `stdin`, allowing input from a local file (as in the following example) as well as from the output of the `fetch-cube-observations` pipeline.

```bash
cat myObservations.ttl \
| npx barnard59 cube check-observations \
    --constraint myConstraint.ttl
```

To enable validation, the pipeline adds to the constraint a `sh:targetClass` property with value `cube:Observation` (assuming that each observation has an explicit property `rdf:type` with value `cube:Observation`).

To leverage streaming, input is split and validated in little batches of adjustable size (the default is 50 and likely it's appropriate in most cases). This allows the validation of very big cubes because observations are not loaded in memory all at once. To ensure triples for the same observation are adjacent (hence processed in the same batch), the input is sorted by subject (and in case the input is large the sorting step relies on temporary local files).

SHACL reports for violations are written to `stdout`.

To limit the output size, there is also a `maxViolations` option to stop validation when the given number of violations is reached.
