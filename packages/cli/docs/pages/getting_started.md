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