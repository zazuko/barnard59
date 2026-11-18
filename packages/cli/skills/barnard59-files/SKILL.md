---
name: barnard59-files
description: Use when reading or writing local files in Barnard59 with node:fs streams, pipeline variables, or CLI output, including choosing paths and formats.
---

# Stream local files

Declare `@prefix op: <https://barnard59.zazuko.com/operations/> .` for both file steps. They take a path followed by optional Node stream options. Relative paths are resolved from the working directory. Use `"path"^^p:FileContents` for small text arguments such as query or rule text. That loader first checks for a variable with that name and resolves relative paths from the pipeline definition directory.

## Pipeline steps

### `fs/createReadStream`

Use `[ op:core\/fs\/createReadStream ("input"^^p:VariableName) ]` or link to `<node:fs#createReadStream>` in an explicit step. It is a byte source. Pass a path as its first positional argument or use a variable so callers can choose the file. An optional second argument can set Node stream options such as `start` and `end` for a byte range. Insert a parser when the next step expects objects or quads. Use `barnard59-rdf` when the source should choose an RDF parser from a path or process paths from a glob.

### `fs/createWriteStream`

Use `[ op:core\/fs\/createWriteStream ("output"^^p:VariableName) ]` or link to `<node:fs#createWriteStream>` in an explicit step. It is a terminal byte sink. Serialize object-mode input first, create the destination directory, and use distinct input and output paths. The writer truncates the destination by default. Set the optional stream options' `flags` to `"a"` when you intentionally want to append.

### Copy a file with both steps

```turtle
@prefix p: <https://pipeline.described.at/> .
@prefix op: <https://barnard59.zazuko.com/operations/> .

<#copy> a p:Pipeline;
  p:variables [
    p:variable [ a p:Variable; p:name "input" ],
               [ a p:Variable; p:name "output" ]
  ];
  p:steps [ p:stepList (
    [ op:core\/fs\/createReadStream ("input"^^p:VariableName) ]
    [ op:core\/fs\/createWriteStream ("output"^^p:VariableName) ]
  ) ].
```

## CLI commands

Run the copy pipeline with the input and output paths.

```sh
npx barnard59 run copy.ttl --variable input=data.txt --variable output=result.txt
```

If the destination is only a concern of the CLI invocation, declare a readable byte pipeline and use `--output result.ext`. Put an explicit writer in the pipeline when the destination is part of the workflow.
