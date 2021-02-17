# barnard59 - Linked Data Pipeline Primer
barnard59 is the project name for our Linked Data pipelining system. `barnard59` is a toolkit to automate *extract*, *transform* and *load* (ETL) like tasks. Its main focus is on creating [RDF & Linked Data](http://linked-data-training.zazuko.com/), a standardized graph data format by the W3C. barnard59 has a clear focus on creating RDF but is not limited to it.

barnard59 is a modular system. The [core-library](https://github.com/zazuko/barnard59) provides basic functionality for running a [pipeline](https://github.com/zazuko/barnard59#concept). Additional functionality is implemented in so-called operations that can be integrated into a pipeline as an extra [step]( https://github.com/zazuko/barnard59#step). Between these steps, streams are used to send messages from the output of one step to the input of the next step. This is very similar to the [pipeline concept](https://en.wikipedia.org/wiki/Pipeline_(Unix)) of Unix-like operating systems, in fact you can integrate standard Unix commands as well by using the [barnard59-shell](https://github.com/zazuko/barnard59-shell) operator.

A properly designed pipeline can handle arbitrarily large datasets and convert them. However, some operations might break the streaming approach in a sense that they work on the complete dataset at once, which will be limited in some ways (memory most probably). One example is the [barnard59-tdb](https://github.com/zazuko/barnard59-tdb) operator, which provides a file-based SPARQL endpoint for doing more complex graph manipulations in a pipeline.

barnard59 is written in JavaScript and is using the [Node.js](https://nodejs.org/) for execution. A typical pipeline is using some standard functionality provided by barnard59, adds some extra steps appropriate for the dataset and often some steps executing plain JavaScript code to do some more advanced manipulations on the data. This is one of the main differentiator to existing solutions we worked with and one of the reasons why barnard59 driven pipelines are very powerful.

barnard59 pipelines are described in RDF, the package `barnard59-core` provides the core functionality to interpret and execute them. Consult the [barnard59 readme](https://github.com/zazuko/barnard59/blob/master/README.md) for a more detailed description about how barnard59 works.

## Getting started

If you are not fluent with Node.js & NPM read more about how to [create a package.json](https://docs.npmjs.com/creating-a-package-json-file) file. Once you understand the basics and created a basic `package.json` file with `npm init`, you can install your first external dependency: `barnard59`. Do this by running:

    npm install --save barnard59 barnard59-formats

This will fetch `barnard59`, `barnard59-formats`, and among others `barnard59-core` and `barnard59-base`. This is all we need to run the first example. To get this, copy or download the [fetch-json-to-ntriples](https://github.com/zazuko/barnard59#examples) example from the examples directory in the root directory of your folder where you installed `barnard59`.

In Node.js it is common to add a ["scripts"-field](https://docs.npmjs.com/misc/scripts), add this line to the `scripts` section of your `package.json`:

    "start": "barnard59 run fetch-json-to-ntriples.ttl --format text/turtle --pipeline http://example.org/pipeline/utc"

If you now type `npm run start`, you should get the following output on your console:

```
$ npm run start

> barnard@1.0.0 start /Users/someone/pipeline-test
> barnard59 run fetch-json-to-ntriples.ttl --format text/turtle --pipeline http://example.org/pipeline/utc

<http://worldtimeapi.org/api/timezone/etc/UTC> <http://purl.org/dc/elements/1.1/date> "2019-11-28T17:58:07.101392+00:00" .
```

This pipeline converts a JSON result from the API at http://worldtimeapi.org/api/timezone/etc/UTC to (minimal) RDF.

If you want to automate a pipeline, continue in the [automation](automation) page and learn about running a pipeline in Docker & CI/CD.

For a more complex example we provide a simple pipeline that [converts CSV files to RDF](https://github.com/zazuko/bafu-ubd) using the CSV on the Web specification for describing the mapping.

## Operations

Obviously you want to convert your own data. To do that, barnard59 provides a bunch of default features in so called operations. To understand how you can add your own steps and pipelines, consult the barnard59 [readme](https://github.com/zazuko/barnard59/blob/master/README.md).

Technically, operations are just normal JavaScript functions which return [streams](https://nodejs.org/api/stream.html) (sync or async). The special thing about the operations in barnard59 packages is the interface (named arguments) and that they are adapted to the use-case. 

This becomes more clear by having a look at one of the packages, `barnard59-ftp`: From an FTP client library in JavaScript one would expect that we have to create an instance, maybe call connect and then read files. The barnard59 package provides a function that does all this in a single function call. However, there are existing functions that can be integrated with only little or (almost) no additional wrapping. This is for example the case for reading and writing files, where only the `fs.create*Stream`-functions are used with index arguments.

While barnard59 is written in JavaScript, nothing stops you of integrating operators in other languages. `barnard59-tdb` for example is wrapping Java based tooling. You can also use existing Node.js wrappers for other libraries which can be found in package registries like [npm](https://www.npmjs.com/). In the future, we plan to support other languages as well with virtual machine based approaches like [WebAssembly](https://webassembly.org/) and/or [GraalVM](https://www.graalvm.org/).

You do not have to write a full barnard59 operator if you just want to manipulate some of the data, for that you can for example use the `filter()` and `map()` functions of the `barnard59-base` package.

The following operators are available.

### Core

* [barnard59](https://github.com/zazuko/barnard59): The base package of barnard59. This is typically the default dependency for npm and it provides the `barnard59` executable used to run the pipeline on command line.
* [barnard59-core](https://github.com/zazuko/barnard59-core): The core component to create and run pipelines. Used by `barnard59`.
* [barnard59-base](https://github.com/zazuko/barnard59-base): This package provides basic operations like `filter`and `map`for pipelines. Operations that are used all the time. Used by `barnard59`.

### Protocols & Formats

* [barnard59-formats](https://github.com/zazuko/barnard59-formats): Support for various formats like CSV on the Web, JSON-LD and N-Triples.
* [barnard59-sparql](https://github.com/zazuko/barnard59-sparql): Run SPARQL queries on endpoints that support the SPARQL protocol.
* [barnard59-tdb](https://github.com/zazuko/barnard59-tdb): SPARQL data processing support using Jena TDB.
* [barnard59-ftp](https://github.com/zazuko/barnard59-ftp): Interact with data on ftp and sftp servers.
* [barnard59-graph-store](https://github.com/zazuko/barnard59-graph-store): SPARQL Graph Store protocol support. 
* [barnard59-kafka](https://github.com/zazuko/barnard59-kafka): Apache Kafka support.
* [barnard59-mqtt](https://github.com/zazuko/barnard59-mqtt): MQTT support.
* [barnard59-px](https://github.com/zazuko/barnard59-px): Support for the PC-Axis (PX) format (Cube).
* [barnard59-shell](https://github.com/zazuko/barnard59-shell): Shell command support.
* [barnard59-http](https://github.com/zazuko/barnard59-http): Generic HTTP protocol support.

### Other

* [barnard59-server](https://github.com/zazuko/barnard59-server): Linked Data pipeline server to run and develop pipelines.
* [barnard59-ui](https://github.com/zazuko/barnard59-ui): User interface for creating and maintaining barnard59 based pipelines. Proof of Concept, needs more love.

