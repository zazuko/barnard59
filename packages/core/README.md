# barnard59-core

The core component of Barnard59 Linked Data pipelines to create and run pipelines.

## Usage

The package exports multiple functions which can be imported like this:

```
import { createPipeline, run } from 'barnard59-core' 
```

### createPipeline(ptr, { basePath, context, logger, variables })

Creates a new `Pipeline` object based on the definition given as graph pointer in `ptr`.
The function accepts the following arguments:

- `ptr`: A graph pointer to the pipeline definition.
- `basePath`: Optional an alternative base path given as string, which is used by the code loaders.
- `context`: Additional optional properties which will be merged into the loader context.
- `logger`: An optional alternative `winston` logger instance that should be used.
  See `defaultLogger()` if you want to create a logger based on the default logger settings.
- `variables`: Additional optional variables which will be merged into the pipeline variables. 

### defaultLoaderRegistry()

Creates an instance of a loader registry that contains all default loaders.
The function can be used to create custom registry instances based on the defaults.

### defaultLogger({ console, errorFilename, filename, level })

The function accepts the following arguments:

- `console` (default: `true`)
- `errorFilename` (default: `null`)
- `filename`: (default: `null`)
- `level`: (default: `error`)

### async run(pipeline, { end = false, resume = false } = {})

Wait for a pipeline to finish.
Optional calls `.end()` or `.resume()` on the stream of the pipeline to trigger processing.

The function accepts the following arguments:

- `pipeline`: The pipeline as Pipeline object.
- `end`: An optional flag, if `true` calls `.end()` on the stream of the pipeline. (default = `false`)
- `resume`: An optional flag, if `true` calls `.resume()` on the stream of the pipeline. (default = `false`)
