---
name: barnard59-pipeline-imports
description: Use when splitting a Barnard59 pipeline across RDF files, wiring step stubs to implementations with code:imports, or sharing a named subpipeline between entry pipelines.
---

# Split a pipeline with code:imports

Keep the step order and caller-specific arguments in the entry pipeline. Put the shared `code:implementedBy` declarations or whole subpipelines in a separate RDF file. Barnard59 follows `code:imports` and merges the imported triples before it expands shorthand steps and selects the pipeline. Use `code:link` in the imported graph to point to a JavaScript module or a package export.

## Pipeline steps

### Supply a step implementation from another file

Give each stub an IRI and use exactly the same IRI in the imported file. An absolute prefix declared in both Turtle files keeps the IRI stable. Blank node labels are local to a document, and `<#step>` in two files usually resolves to two different IRIs. Keep one `code:implementedBy` per step and put each argument binding in one place. Imported triples are merged with the entry graph, so an import adds declarations to the stub.

**`pipeline.ttl`**

```turtle
@prefix ex: <https://example.org/pipeline/> .
@prefix code: <https://code.described.at/> .
@prefix p: <https://pipeline.described.at/> .

[] code:imports <./steps/text.ttl> .

ex:main a p:Pipeline, p:Readable ;
  p:steps [ p:stepList (ex:read ex:prefix) ] .

ex:read a p:Step ;
  code:implementedBy [ a code:EcmaScriptModule; code:link <node:fs#createReadStream> ] ;
  code:arguments ("input.txt") .

ex:prefix a p:Step ;
  code:arguments ("Imported: ") .
```

**`steps/text.ttl`**

```turtle
@prefix ex: <https://example.org/pipeline/> .
@prefix code: <https://code.described.at/> .

ex:prefix code:implementedBy [
  a code:EcmaScriptModule ;
  code:link <./prefix.mjs#default>
] .
```

**`steps/prefix.mjs`**

```js
export default function prefix(text) {
  return async function* (chunks) {
    yield Buffer.from(text)
    yield* chunks
  }
}
```

In local Turtle files, `<./steps/text.ttl>` resolves relative to the importing document, and `<./prefix.mjs#default>` resolves relative to the imported document when it has no explicit `@base`. An explicit `@base` changes how both relative IRIs resolve. The quoted `"input.txt"` is a file path argument resolved by `node:fs` from the working directory. Use a separate import node (`[] code:imports <...> .`) for each RDF file.

### Share a whole subpipeline

Define the complete, named `p:Pipeline` with its own `p:steps` and stream types in the imported file. Reference its IRI directly in the caller's `p:stepList`, or pass it as a positional argument to an operation that accepts a nested pipeline, such as `concat` or `forEach`. Use a shared absolute IRI for that reference, just as with a step stub.

## CLI commands

```sh
printf 'hello\n' > input.txt
npx barnard59 run pipeline.ttl
```

Run from the directory containing `input.txt`. The output begins with `Imported: hello`.

Select the entry pipeline explicitly with `--pipeline <IRI>` if the merged graph has multiple roots.
