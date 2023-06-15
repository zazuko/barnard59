# barnard59

`barnard59` is a toolkit to automate extract, transform and load (ETL) tasks. Its main focus is on creating [Linked Data](http://linked-data-training.zazuko.com/). It allows you to generate RDF out of non-RDF data sources. In doing so, it follows the standard adopted in [Semantic Web](https://www.w3.org/standards/semanticweb/).

More specifically, `barnard59` is an engine to execute data pipelines.

In this monorepo you will find the various `barnard59-*` packages:

| Package                         | Latest version                                                                  |                                          |
|---------------------------------|---------------------------------------------------------------------------------|------------------------------------------|
| [`barnard59`](packages/cli)     | [![](https://badge.fury.io/js/barnard59.svg)](https://npm.im/barnard59)         | CLI to run pipelines                     |
| [`barnard59-rdf`](packages/rdf) | [![](https://badge.fury.io/js/barnard59-rdf.svg)](https://npm.im/barnard59-rdf) | Operations for RDF/JS quads and datasets |

More to come as we gradually consolidate other, initially separate repositories.
