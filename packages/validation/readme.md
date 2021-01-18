### Pipeline validation
Pipeline validation enables you to verify the consistency of your RDF pipelines. It ensures that all pipeline steps are consistent, and can be executed one after another.
It is a programmatic reflection of (principles behind barnard59)[https://github.com/zazuko/barnard59/wiki/Validation]

This script will help you understand what is wrong in with your pipeline. Documentation behing (barnard59)[https://github.com/zazuko/barnard59] will guide you how to build a valid one.

## Setup

Install all dependencies with
```npm install```

## Execute
Validate your pipeline with
```node app.js your-pipeline-file```
For an example, try:
```node app.js sample-pipelines/fetch-json-to-ntriples.ttl```

The following options are available:
* To execute only one pipeline from your file:
```node app.js your-pipeline-file -p your-pipeline-iri```
For an example, try:
```node app.js sample-pipelines/fetch-json-to-ntriples.json -p http://example.org/pipeline/utc```

* To print all warnings:
```node app.js your-pipeline-file -v```
For an example, try:
```node app.js sample-pipelines/fetch-json-to-ntriples.json -v```

* To return error messages in ```.json``` format:
```node app.js your-pipeline-file | cat```
