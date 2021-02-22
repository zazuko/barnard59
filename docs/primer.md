# barnard59

barnard59 is the project name for our Linked Data pipelining system. `barnard59` is a toolkit to automate *extract*, *transform* and *load* (ETL) like tasks. Its main focus is on creating [RDF & Linked Data](http://linked-data-training.zazuko.com/), a standardized graph data format by the W3C. `barnard59` has a clear focus on creating RDF out of non-RDF data sources.

barnard59 can be used to:
* download the source the data
* validate it
* transform it to linked data
* publish it

## Concept
barnard59 is a modular system. The [main library](https://github.com/zazuko/barnard59) provides basic functionality for running a [pipeline](https://github.com/zazuko/barnard59#executing-pipeline). Additional functionalities are implemented in so-called [operations](). These operations can be integrated into a pipeline as a step. Between the steps, streams are used to send messages from the output of one step to the input of the next step. This is very similar to the [pipeline concept](https://en.wikipedia.org/wiki/Pipeline_(Unix)) of Unix-like operating systems.

A properly designed pipeline can handle arbitrarily large datasets. However, some operations might break the streaming approach. They work on the complete dataset at once, which may be limiting in some ways (memory most probably). One example is the [barnard59-tdb](https://github.com/zazuko/barnard59-tdb) operator, which provides a file-based SPARQL endpoint for doing complex graph manipulations in a pipeline.

barnard59 is written in JavaScript and is using the [Node.js](https://nodejs.org/) for execution. A typical pipeline is using standard functionality provided by barnard59, and additional steps appropriate for the dataset. These additional steps can be defined using plain JavaScript code. Using inline code allows to easily integrate advanced data manipulations. It gives user the flexibility without imposing additional constraints. The ability to integrate your own code to a pipeline definition is the main differentiator to existing solutions. It is also one of the reasons why barnard59 pipelines are so powerful.

barnard59 pipelines are defined as RDF. The package `barnard59` provides the core functionality to interpret and execute them. For more details on executing pipelines, go to [barnard59 readme](https://github.com/zazuko/barnard59/blob/master/README.md).

## Further resources
You can learn more about `barnard59` universe here:
* [Getting started](pages/getting_started.md)
* [Pipeline concept](pages/pipeline.md)
* [Pipeline validation](pages/pipeline-validation.md)
* [Operations](pages/operations.md)
* [Docker & GitLab CI](pages/automation.md)