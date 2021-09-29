# barnard59

`barnard59` is a toolkit to automate extract, transform and load (ETL) tasks. Its main focus is on creating [Linked Data](http://linked-data-training.zazuko.com/). It allows you to generate RDF out of non-RDF data sources. In doing so, it follows the standard adopted in [Semantic Web](https://www.w3.org/standards/semanticweb/).

More specifically, `barnard59` is an engine to execute data pipelines.

## Pipeline

A pipeline is a way to extract, transform, and load data (ETL). It allows you to consolidate data from various sources, and publish it as RDF.
Using a pipeline you can:
* download the source the data
* validate it
* transform it to linked data
* publish it


`barnard59` expects a pipeline to be defined as linked-data. The supported formats are:
* `application/ld+json`
* `application/n-triples`
* `text/turtle`
* `application/rdf+xml`

To learn more about building your own pipeline, go [here](https://github.com/zazuko/barnard59/wiki).

## Requirements
To execute pipeline with `barnard59`, you will need `node.js` environment. All `node` and `npm` versions which are actively maintained are supported by `barnard59`.


To check if you have Node.js installed, run this command in your terminal:
`node -v`

To confirm that you have npm installed, run:
`npm -v`

If you need to install (or upgrade) node, or npm, go [here](https://nodejs.org/en/download/).
Once node and npm are installed, you can install the dependencies for this project. To do so, run:
`npm install`
## Executing pipeline

To execute pipeline, run:
`barnard59 run <pipeline_file>`

The following arguments are available:
* `--pipeline <pipeline_iri>`
* `--output <filename>`
* `--verbose` or `-v`
* `--enable-buffer-monitor`
* `--variable <name=value>`

If the file contains more than one pipeline, you can define the pipeline to execute. By default, first pipeline will be executed.
To define pipeline to be executed, run:
`barnard59 run <pipeline_file> --pipeline <pipeline_iri>`

Some pipelines will produce a write stream. By default, this stream can be will be printed in the terminal. To write it to the file, run:
`barnard59 run <pipeline_file> --output <output_file>`

Pipelines can represent complex data manipulation. To better understand what is happening, add options:
* `--verbose` or `-v` - to enable diagnostic console output
* `--enable-buffer-monitor` - to enable histogram of buffer usage

## Passing arguments to the pipeline
It is possible to pass arguments from command line to the pipeline. This allows you to use a variable in the pipeline, whithout defining its value. The key-value pairs for pipeline variables can be provided at the runtime. In the cli tool, this can be done via the `--variable` argument.
To pass an argument to the pipeline, run:
`barnard59 run <pipeline_file> --variable <variable_name_in_pipeline>=<value>`

For example, to pass `example.txt` as a `filename` to `pipeline.json`, run:
`barnard59 run pipeline.json --variable filename=example.txt`

In a [CI/CD environment](https://github.com/zazuko/barnard59/wiki/automation) you might want to define sensitive arguments like usernames and passwords as environment variables. To pass them to the pipeline, run:
`barnard59 run pipeline.json --variable password=$PASSWORD`
where `$PASSWORD` is a an environment variable.

To pass multiple arguments to the pipeline, call `--variable` argument multiple times:
`barnard59 run <pipeline_file> --variable <variable1>=<value1> --variable <variable2>=<value2> ... --variable <variableN>=<valueN>`

For example, to pass `$USER` as a `user`, and `$PASSWORD` as a `password` to `pipeline.json`, run:
`barnard59 run pipeline.json --variable user=$USER --variable password=$PASSWORD`


## Examples

### Transform csv file

This pipeline parses a CSV file. It uses the CSV on the Web format. The file `examples/parse-csvw.ttl` contains two pipelines:
* `<parseCsvw>` - the main pipeline
* `<parseMetadata>` - the metadata pipeline

Tho execute the main pipeline, run:

```
node bin/barnard59.js run examples/parse-csvw.ttl --pipeline=http://example.org/pipeline/parseCsvw
```
Or, if you'd like to use [npx](https://www.npmjs.com/package/npx) you can run: 
```
npx barnard59 run examples/parse-csvw.ttl --pipeline=http://example.org/pipeline/parseCsvw
```

### Transform json file

This pipeline downloads, and transforms json file. It:

* fetches a JSON document from the predefined URL
* transforms JSON into a JSON-LD structure
    This is done using a map step, and a `context` variable in the JSON file.
* generates RDF-JS quads from JSON structure
* serializes the quads into N-Triples.

For comparison, the same pipeline is defined in JSON-LD and Turtle format.

To execute the JSON-LD pipeline, run:

```
node bin/barnard59.js run examples/fetch-json-to-ntriples.json --pipeline http://example.org/pipeline/cet
```
with npx: 
```
npx barnard59 run examples/fetch-json-to-ntriples.json --pipeline http://example.org/pipeline/cet
```

The `--pipeline` parameter is required, as the file contains two pipelines.


To execute the Turtle pipeline, run:

```
node bin/barnard59.js run examples/fetch-json-to-ntriples.ttl --pipeline http://example.org/pipeline/utc
```
or
```
npx barnard59 run examples/fetch-json-to-ntriples.ttl --pipeline http://example.org/pipeline/utc
```

By default, the pipeline stream will be written to `stdout`. Use `--output` parameter to write output to the file:

```
node bin/barnard59.js run examples/fetch-json-to-ntriples.json --pipeline http://example.org/pipeline/cet --output test.nt
```
or
```
npx barnard59 run examples/fetch-json-to-ntriples.json --pipeline http://example.org/pipeline/cet --output test.nt
```

