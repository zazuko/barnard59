# barnard59-cube


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

This pipeline is useful mainly for cubes published with [cube creator](https://github.com/zazuko/cube-creator) (if the cube definition is manually crafted, likely it's already available as a local file).


### check cube constraint

Pipeline `check-cube-constraint` validates the input constraint against the shapes provided with the `profile` variable (the default profile is https://cube.link/latest/shape/standalone-constraint-constraint but [cube link](https://cube.link/) defines additional ones).

The pipeline reads the constraint from `stdin`, allowing input from a local file (as in the following example) as well as from the output of the `fetch-cube-constraint` pipeline (in most cases it's useful to have the constraint in a local file because it's needed also for the `check-cube-observations` pipeline).

```bash
cat myConstraint.ttl \
| npx barnard59 run ./pipeline/cube-validation.ttl \
    --pipeline http://barnard59.zazuko.com/pipeline/cube-validation/check-cube-constraint \
    --variable profile=https://cube.link/v0.0.5/shape/standalone-constraint-constraint
```
TODO: explain how validation errors are reported


### fetch cube observations

Pipeline `fetch-cube-observations` queries a given SPARQL endpoint (default is https://lindas.admin.ch/query) to retrieve the observations of a given cube.

```bash
npx barnard59 run ./pipeline/cube-validation.ttl \
    --pipeline http://barnard59.zazuko.com/pipeline/cube-validation/fetch-cube-observations \
    --variable cube=https://agriculture.ld.admin.ch/agroscope/PRIFm8t15/2 \
    --variable endpoint=https://int.lindas.admin.ch/query
```
Results are returned sorted by observation so that the potentially big output stream can be split (by the `check-cube-observations` pipeline) and each observation can be processed separately.



### check cube observations

Pipeline `check-cube-observations` validates the input observations against the shapes provided with the _constraint_ variable.

The pipeline reads the observations from `stdin`, allowing input from a local file (as in the following example) as well as from the output of the `fetch-cube-observations` pipeline.

```bash
cat myObservations.ttl \
| npx barnard59 run ./pipeline/cube-validation.ttl \
    --pipeline http://barnard59.zazuko.com/pipeline/cube-validation/check-cube-observations \
    --variable constraint=myConstraint.ttl
```
To enable validation, the pipeline adds to the constraint a `sh:targetClass` property with value `cube:Observation` (assuming that each observation has an explicit property `rdf:type` with value `cube:Observation`).

To leverage streaming, the pipeline also assumes the triples for the same observation to be adjacent (`fetch-cube-observations` achieves this sorting by observation).

TODO: explain how validation errors are reported
