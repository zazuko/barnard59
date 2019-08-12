# barnard59-core

The core component of Barnard59 Linked Data pipelines to create and run pipelines.

## Usage

The package exports a `pipeline` and a `run` functions which can be imported like this:

```
const { pipeline, run } = require('barnard59-core') 
```

### pipeline(definition, iri)

The `pipeline` factory function creates new instances based on the given definition.

- `definition`: A RDFJS Dataset that contains all quads of the definition.
- `iri`: A RDFJS Term that points to the subject of the pipeline.

### async run(something) 

Runs a sync function, async function or a stream and waits for it to finish.

- `something`: The function or stream.
