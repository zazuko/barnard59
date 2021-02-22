## Operations

Obviously you want to convert your own data. To do that, barnard59 provides a bunch of default features in so called operations. To understand how you can add your own steps and pipelines, consult the barnard59 [readme](https://github.com/zazuko/barnard59/blob/master/README.md).

Technically, operations are just normal JavaScript functions which return [streams](https://nodejs.org/api/stream.html) (sync or async). The special thing about the operations in barnard59 packages is the interface (named arguments) and that they are adapted to the use-case.

This becomes more clear by having a look at one of the packages, `barnard59-ftp`: From an FTP client library in JavaScript one would expect that we have to create an instance, maybe call connect and then read files. The barnard59 package provides a function that does all this in a single function call. However, there are existing functions that can be integrated with only little or (almost) no additional wrapping. This is for example the case for reading and writing files, where only the `fs.create*Stream`-functions are used with index arguments.

While barnard59 is written in JavaScript, nothing stops you of integrating operators in other languages. `barnard59-tdb` for example is wrapping Java based tooling. You can also use existing Node.js wrappers for other libraries which can be found in package registries like [npm](https://www.npmjs.com/). In the future, we plan to support other languages as well with virtual machine based approaches like [WebAssembly](https://webassembly.org/) and/or [GraalVM](https://www.graalvm.org/).

You do not have to write a full barnard59 operator if you just want to manipulate some of the data, for that you can for example use the `filter()` and `map()` functions of the `barnard59-base` package.

The following operators are available.

### Core

* [barnard59](https://github.com/zazuko/barnard59): The base package of barnard59. This is typically the default dependency for npm and it provides the `barnard59` executable used to run the pipeline on command line.
* [barnard59-core](https://github.com/zazuko/barnard59-core): The core component to create and run pipelines.
* [barnard59-base](https://github.com/zazuko/barnard59-base): This package provides basic operations like `filter`and `map`for pipelines. Operations that are used all the time.

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
* [barnard59-rdf](https://github.com/zazuko/barnard59-rdf): RDF support.
* [barnard59-csvw](https://github.com/zazuko/barnard59-csvw): Simplifies handling CSVW mapping documents.
* [barnard59-tbd](https://github.com/zazuko/barnard59-tdb): SPARQL data processing support for Barnard59 Linked Data pipelines using Jena TDB
* [barnard59-protocols](https://github.com/zazuko/barnard59-protocols): Linked Data pipelines


### Other

* [barnard59-server](https://github.com/zazuko/barnard59-server): Linked Data pipeline server to run and develop pipelines.
* [barnard59-ui](https://github.com/zazuko/barnard59-ui): User interface for creating and maintaining barnard59 based pipelines. Proof of Concept, needs more love.
* [barnard59-pipeline-validation](https://github.com/zazuko/barnard59-pipeline-validation): A tool to validate barnard59 pipeline definition files.