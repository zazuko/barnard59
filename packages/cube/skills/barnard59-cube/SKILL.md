---
name: barnard59-cube
description: Use when building RDF Data Cube observations and constraint shapes, retrieving cubes, or validating cube metadata and observations in Barnard59.
---

# RDF Data Cubes

Declare `@prefix op: <https://barnard59.zazuko.com/operations/> .` and use shorthand such as `[ op:cube\/toObservation () ]`. For explicit links, select the named export from `node:barnard59-cube/cube.js`.

## Pipeline steps

### `toObservation`

Feed it one dataset or quad array per observation, for example by grouping the quads from a row mapping. It normalizes the observation and emits a quad array with the observation identifier, Cube Schema typing, and membership links. Pass named `dimensions` or `blacklist` lists to control which predicates are used. Use `useIndex` or `useDate` when observation identifiers should be based on row order or dates. Keep one observation per chunk for `buildCubeShape`.

### `buildCubeShape`

Feed it observation datasets or quad arrays, typically the output of `toObservation`. It forwards observation quads as arrays and emits a derived shape dataset for each cube on completion. Supply `metadata` as a separate readable quad stream when metadata should inform the shape. Use `excludeValuesOf` to exclude predicates from value collection, `inListMaxSize` to bound enumerated values, or `graph` to place the shape in a particular graph. Flatten grouped output before serialization or upload.

### Build a cube and derive its constraint

Save the following as `measurements.ttl`. Keep each subject's quads consecutive so `splitDataset/bySubject` emits one dataset per observation.

```turtle
@prefix ex: <https://example.org/> .
@prefix row: <https://example.org/temperature/row/> .

row:1 ex:station "Bern" ; ex:celsius 18.5 .
row:2 ex:station "Geneva" ; ex:celsius 20.0 .
```

Save this as `metadata.ttl`. The cube IRI is the parent of the observation set IRI configured in the pipeline.

```turtle
@prefix schema: <http://schema.org/> .

<https://example.org/temperature> schema:name "Station temperatures" .
```

Save this as `build-cube.ttl`.

```turtle
@prefix code: <https://code.described.at/> .
@prefix ex: <https://example.org/pipeline/> .
@prefix op: <https://barnard59.zazuko.com/operations/> .
@prefix p: <https://pipeline.described.at/> .

ex:buildCube a p:Pipeline, p:Readable ;
  p:steps [ p:stepList (
    [ op:rdf\/open ("measurements.ttl") ]
    [ op:rdf\/splitDataset\/bySubject () ]
    [ op:cube\/toObservation [
      code:name "observations" ;
      code:value "https://example.org/temperature/observation/"
    ] ]
    [ op:cube\/buildCubeShape [ code:name "metadata" ; code:value ex:metadata ] ]
    [ op:base\/flatten () ]
    [ op:formats\/ntriples\/serialize () ]
  ) ] .

ex:metadata a p:Pipeline, p:ReadableObjectMode ;
  p:steps [ p:stepList (
    [ op:rdf\/open ("metadata.ttl") ]
  ) ] .
```

`toObservation` emits one quad array per observation. `buildCubeShape` reads those arrays and uses the separate metadata stream to add the cube's name. It emits the observations followed by the cube metadata and the derived SHACL constraint. `flatten` feeds individual quads to the serializer.

## CLI commands

The fetch commands take `--cube <IRI>` and `--endpoint <SPARQL query URL>` and write line-oriented RDF to stdout.

### `fetch-cube`

Run `barnard59 cube fetch-cube --cube <IRI> --endpoint <URL>` to retrieve cube metadata, constraints, observation sets, and observations in one stream. For large cubes, use the individual fetch commands when you only need a subset.

### `fetch-metadata`

Run `barnard59 cube fetch-metadata --cube <IRI> --endpoint <URL>` for the metadata and constraint shape, along with an observation sample. Redirect to a file for use with `check-metadata`.

### `fetch-observations`

Run `barnard59 cube fetch-observations --cube <IRI> --endpoint <URL>` for the observation data. Save the output separately when the observations and their constraint will be validated independently.

### `fetch-constraint`

Run `barnard59 cube fetch-constraint --cube <IRI> --endpoint <URL>` to retrieve only the constraint graph. Save it to a local RDF file and use that file as `--constraint` when checking observations.

### `check-metadata`

Run `barnard59 cube check-metadata < cube-metadata.nt`. It validates RDF from stdin against a profile and emits an RDF report. Supply `--profile` as a local RDF file or URL to replace the built-in default profile URL. For a remote profile with an incorrect content type, override parser selection with `--profileFormat text/turtle`.

### `check-observations`

Run `barnard59 cube check-observations --constraint constraint.ttl < observations.nt`. The constraint must be a local RDF file. The input must explicitly type observations as `cube:Observation`. The command sorts by subject, batches observations, and emits SHACL report quads.

The default `--batchSize` is `50`. Use `--batchSize 0` when constraints require all observations in one validation dataset, such as `sh:class` dependencies across batches. `--maxViolations` controls when reporting stops, and `--sortChunkSize` controls sorting chunk size. Use `barnard59 shacl report-summary` to summarize a saved report.

### Build the example cube

Install the CLI and operation packages in the project.

```sh
npm install barnard59 barnard59-base barnard59-cube barnard59-formats barnard59-rdf
```

Run the pipeline defined above to write the observations, metadata, and constraint to `cube.nt`.

```sh
npx barnard59 run build-cube.ttl --pipeline https://example.org/pipeline/buildCube --output cube.nt
```

### Validate a cube and summarize the report

The `cube.nt` from the build example contains both the observations and one `cube:Constraint`. Pass the file to both inputs. The validator uses that constraint and targets the resources typed as `cube:Observation`. Install `barnard59-shacl` to use the summary command.

```sh
npm install barnard59-shacl
npx barnard59 cube check-observations --constraint cube.nt < cube.nt > report.nt
npx barnard59 shacl report-summary < report.nt
```

For a cube stored at a SPARQL endpoint, set `CUBE_IRI` to the cube's IRI and `SPARQL_ENDPOINT` to the query URL. Fetch the constraint and observations into separate files.

```sh
npx barnard59 cube fetch-constraint --cube "$CUBE_IRI" --endpoint "$SPARQL_ENDPOINT" > constraint.nt &&
npx barnard59 cube fetch-observations --cube "$CUBE_IRI" --endpoint "$SPARQL_ENDPOINT" > observations.nt
```

Once both fetches succeed, validate the observations and summarize the report.

```sh
npx barnard59 cube check-observations --constraint constraint.nt < observations.nt > report.nt
npx barnard59 shacl report-summary < report.nt
```
