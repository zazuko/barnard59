# barnard59

#### Definition via Command Line Arguments

Not all variables used in the pipeline need to be part of the pipeline definition.
These abstract pipelines can use variables provided by the runtime, like the cli tool.
In the cli tool, this can be done via the `--variable` argument.
See the usage for more details.
The variable from the previous example could be defined like this in the cli:

`barnard59 run pipeline.json --pipeline http://example.org/#pipeline --variable filename=example.txt`

In a [CI/CD environment](https://github.com/zazuko/barnard59/wiki/automation) you might want to pass sensitive arguments like usernames and passwords via environment-variables. This can be done by referencing it like this:

`barnard59 run pipeline.json --pipeline http://example.org/#pipeline --variable password=$PASSWORD`

where `$PASSWORD`is a valid environment-variable.

## Examples

### fetch-json-to-ntriples

A very simple pipeline which fetches a JSON document from the URL defined as variable in the pipeline.
In a map step the JSON is transformed into a valid JSON-LD structure using the context defined in a variable.
The JSON-LD parser generates RDFJS quads out of the JSON structure.
As last step the quads are serialized into N-Triples.

The same pipeline definition is provided as JSON-LD and Turtle for a comparison.

The JSON-LD version of the pipeline can be run with the following command:

```
node bin/barnard59.js run examples/fetch-json-to-ntriples.json --pipeline http://example.org/pipeline/cet
```

The `--pipeline` parameter is required, cause the definition contains two pipelines.

The Turtle version of the pipeline requires the `--format` parameter to parse the definition:

```
node bin/barnard59.js run examples/fetch-json-to-ntriples.ttl --format text/turtle --pipeline http://example.org/pipeline/utc
```

The command line tool pipes the pipeline stream to `stdout` by default.
With the `--output` parameter, the output can be also written to a file:

```
node bin/barnard59.js run examples/fetch-json-to-ntriples.json --pipeline http://example.org/pipeline/cet --output test.nt
```

### parse-csvw

A simple pipeline to parse a CSV file using CSV on the Web.
This example shows how a Pipeline can be used as an argument for a step.

```
node bin/barnard59.js run examples/parse-csvw.ttl --format=text/turtle --pipeline=http://example.org/pipeline/parseCsvw
```
