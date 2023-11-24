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

The following pipelines retrieve and validate cube observations and their constraints.

### fetch cube

Pipeline `fetch-cube` queries a given SPARQL endpoint to retrieve 
a [concise bounded description](https://docs.stardog.com/query-stardog/#describe-queries) of a given cube and its constraint (excluding the observations).

```bash
npx barnard59 cube fetch-cube \
  --cube https://agriculture.ld.admin.ch/agroscope/PRIFm8t15/2 \
  --endpoint https://int.lindas.admin.ch/query
```


This pipeline is useful mainly for cubes published with [cube creator](https://github.com/zazuko/cube-creator) (if the cube definition is manually crafted, likely it's already available as a local file).


### check constraint

Pipeline `check-constraint` validates the input constraint against the shapes provided with the `profile` variable (the default profile is https://cube.link/latest/shape/standalone-constraint-constraint).

The pipeline reads the constraint from `stdin`, allowing input from a local file (as in the following example) as well as from the output of the `fetch-cube` pipeline (in most cases it's useful to have the constraint in a local file because it's needed also for the `check-observations` pipeline).

```bash
cat myConstraint.ttl \
| npx barnard59 cube check-constraint \
    --profile https://cube.link/v0.1.0/shape/standalone-constraint-constraint
```
SHACL reports for violations are written to `stdout`.


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
cat myObservations.ttl \
| npx barnard59 cube check-observations \
    --constraint myConstraint.ttl
```

To enable validation, the pipeline adds to the constraint a `sh:targetClass` property with value `cube:Observation`, requiring that each observation has an explicit `rdf:type`.

To leverage streaming, input is split and validated in little batches of adjustable size (the default is 50 and likely it's appropriate in most cases). This allows the validation of very big cubes because observations are not loaded in memory all at once. To ensure triples for the same observation are adjacent (hence processed in the same batch), the input is sorted by subject (and in case the input is large the sorting step relies on temporary local files).

SHACL reports for violations are written to `stdout`.

To limit the output size, there is also a `maxViolations` option to stop validation when the given number of violations is reached.

### Known issues

Command `check-constraint` may fail if there are `sh:in` constraints with too many values.
