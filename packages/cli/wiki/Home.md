# barnard59

## Why
`barnard59` is a toolkit to automate extract, transform and load (ETL) like tasks. Its main focus is on creating [RDF & Linked Data](http://linked-data-training.zazuko.com/), a standardized graph data format by the W3C. barnard59 has a clear focus on creating RDF but is not limited to it.

It is built on many years of experience in creating RDF out of non-RDF data sources. Our goals & design principles are inspired by [the Unix philosophy](http://www.faqs.org/docs/artu/ch01s06.html):

* *Describe the tasks in an abstracted way*. We use RDF to describe the so-called pipeline & steps, barnard59 is an engine to execute them.
* *Enable executing code where necessary*. Sometimes plain code is faster & smarter than writing complex abstractions. You can execute in-line code in the pipeline in case you need expressivity.
* *Automate everything*. barnard59 can be run within CI/CD toolkits like GitLab, run in a Docker container or simply within a node.js environment.

barnard59 can be used for many different tasks, including, but not limited to

* Convert existing data to RDF. There is built-in support for CSV and JSON. Transformation is done in a streaming way when possible and thus can handle very large input data.
* Shell & pipe support: Plug to existing command-line utilities you are comfortable with and work with their output.
* Read from and write to SPARQL endpoints

barnard59 can be easily extended by providing additional functionality as plugin. We also work on user interfaces, so you do not have to write your pipelines in Turtle/RDF.

We provide a list of all operations supported by barnard59 in our [primer](https://github.com/zazuko/barnard59/wiki/primer) in the wiki.



## Pages
* barnard59 [Primer](primer)
* Running barnard59 in [Docker & GitLab CI](automation)
* [pipeline rules](https://github.com/zazuko/barnard59/wiki/Validation#pipeline)