# barnard59-validation
![CI status](https://github.com/zazuko/barnard59-validation/workflows/Node.js%20CI/badge.svg)


### Pipeline validation

Pipeline validation enables you to verify the consistency of your RDF pipelines. It ensures that all pipeline steps are consistent, and can be executed one after another.
It is a programmatic reflection of [principles behind barnard59](https://github.com/zazuko/barnard59/wiki/Validation)

This script will help you understand what is wrong with your pipeline. Documentation behind [barnard59](https://github.com/zazuko/barnard59) will guide you how to build a valid one.

## Usage

Install globally:  
`npm install -g barnard59-validation`

CLI help:  
`barnard59-validate -h`

Validating a pipeline definition:  
`barnard59-validate ./sample-pipelines/fetch-json-to-ntriples.ttl`

### Available Options

* Validating a single pipeline by its IRI:  
    `barnard59-validate your-pipeline-file -p your-pipeline-iri`  
    For an example, try:  
    `barnard59-validate ./sample-pipelines/fetch-json-to-ntriples.json -p http://example.org/pipeline/utc`
* Printing all warnings:  
    `barnard59-validate your-pipeline-file -v`  
    For an example, try:  
    `barnard59-validate ./sample-pipelines/fetch-json-to-ntriples.json -v`
* To return error messages in `.json` format:  
    `barnard59-validate your-pipeline-file | cat`
