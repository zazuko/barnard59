# barnard59

## Why
`barnard59` is a toolkit to automate extract, transform and load (ETL) tasks. Its main focus is on creating [Linked Data](http://linked-data-training.zazuko.com/). It allows you to generate RDF out of non-RDF data sources. In doing so, it follows the standard adopted in [Semantic Web](https://www.w3.org/standards/semanticweb/).


Our principles are inspired by Unix philosophy:

* *Describe the tasks in an abstracted way*. We use RDF to describe data transformation. This transformation process is defined in pipelines. barnard59 is an engine to execute them.
* *Enable executing code where necessary*. Sometimes plain code is faster & smarter than writing complex abstractions. You can execute in-line code in the pipeline in case you need expressivity.
* *Automate everything*. barnard59 can be run within CI/CD tools, in a Docker container, or in a node.js environment.

barnard59 can be used to:
* Download data
* Validate data
* Convert data to RDF
* Upload data to SPARQL endpoints

List of all operations supported by barnard59 is available [here](https://github.com/zazuko/barnard59/wiki/primer).



## Pages
* barnard59 [Primer](primer)
* Running barnard59 in [Docker & GitLab CI](automation)
* [pipeline rules](https://github.com/zazuko/barnard59/wiki/Validation#pipeline)