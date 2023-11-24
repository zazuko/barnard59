# barnard59

`barnard59` is a toolkit to automate extract, transform and load (ETL) tasks. Its main focus is on creating [Linked Data](http://linked-data-training.zazuko.com/). It allows you to generate RDF out of non-RDF data sources. In doing so, it follows the standard adopted in [Semantic Web](https://www.w3.org/standards/semanticweb/).

More specifically, `barnard59` is an engine to execute data pipelines.

In this monorepo you will find the various `barnard59-*` packages:

| Package                                         | Latest version                                                                                  |                                                                                        |
|-------------------------------------------------|-------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| [`barnard59`](packages/cli)                     | [![](https://badge.fury.io/js/barnard59.svg)](https://npm.im/barnard59)                         | CLI to run pipelines                                                                   |
| [`barnard59-base`](packages/base)               | [![](https://badge.fury.io/js/barnard59-base.svg)](https://npm.im/barnard59-base)               | Provides the basic pipeline steps                                                      |
| [`barnard59-core`](packages/core)               | [![](https://badge.fury.io/js/barnard59-core.svg)](https://npm.im/barnard59-core)               | Core package                                                                           |
| [`barnard59-csvw`](packages/csvw)               | [![](https://badge.fury.io/js/barnard59-csvw.svg)](https://npm.im/barnard59-csvw)               | Simplifies handling CSVW mapping documents in pipelines                                |
| [`barnard59-formats`](packages/formats)         | [![](https://badge.fury.io/js/barnard59-formats.svg)](https://npm.im/barnard59-formats)         | Parse and serialize various formats in Linked Data pipelines                           |
| [`barnard59-ftp`](packages/ftp)                 | [![](https://badge.fury.io/js/barnard59-ftp.svg)](https://npm.im/barnard59-ftp)                 | FTP support for Linked Data pipelines                                                  |
| [`barnard59-graph-store`](packages/graph-store) | [![](https://badge.fury.io/js/barnard59-graph-store.svg)](https://npm.im/barnard59-graph-store) | [SPARQL Graph Store Protocol](https://www.w3.org/TR/sparql11-http-rdf-update/) support |
| [`barnard59-http`](packages/http)               | [![](https://badge.fury.io/js/barnard59-http.svg)](https://npm.im/barnard59-http)               | HTTP protocol for Linked Data pipelines                                                |
| [`barnard59-rdf`](packages/rdf)                 | [![](https://badge.fury.io/js/barnard59-rdf.svg)](https://npm.im/barnard59-rdf)                 | Operations for RDF/JS quads and datasets                                               |
| [`barnard59-s3`](packages/s3)                   | [![](https://badge.fury.io/js/barnard59-s3.svg)](https://npm.im/barnard59-s3)                   | S3 support for Linked Data pipelines                                                   |
| [`barnard59-sparql`](packages/sparql)           | [![](https://badge.fury.io/js/barnard59-sparql.svg)](https://npm.im/barnard59-sparql)           | Query SPARQL endpoint from pipeline                                                    |
| [`barnard59-shacl`](packages/shacl)             | [![](https://badge.fury.io/js/barnard59-shacl.svg)](https://npm.im/barnard59-shacl)             | Run SHACL in Linked Data pipelines                                                     |
| [`barnard59-validation`](packages/validation)   | [![](https://badge.fury.io/js/barnard59-validation.svg)](https://npm.im/barnard59-validation)   | Verify the consistency of your RDF pipelines                                           |

More to come as we gradually consolidate other, initially separate repositories.
