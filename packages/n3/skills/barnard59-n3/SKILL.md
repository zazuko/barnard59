---
name: barnard59-n3
description: Use when applying Notation3 inference rules to RDF/JS quad batches or RDF from standard input in Barnard59.
---

# N3 inference

## Pipeline steps

### `applyRules`

With `@prefix op: <https://barnard59.zazuko.com/operations/> .`, use `op:n3\/applyRules`. For an explicit step, link to `<node:barnard59-n3/applyRules.js#default>`. Pass the N3 rules as named `rulesText`. The transform runs the rules independently against each iterable of RDF/JS quads and emits an array for that input chunk. Group related quads into one dataset or array before applying rules that depend on them together. Flatten result arrays before feeding a quad serializer.

`includeInput` defaults to false, so output contains only derived quads. Set it to true to include the input quads as well. In a custom pipeline, `p:FileContents` loads the rule text relative to the pipeline definition file.

```turtle
code:arguments [ code:name "rulesText"; code:value "rules.n3"^^p:FileContents ],
               [ code:name "includeInput"; code:value true ] .
```

## CLI commands

### `n3 apply`

The command reads RDF from stdin, gathers it into one dataset, applies the rules, and writes serialized RDF. Install `barnard59-base`, `barnard59-formats`, and `barnard59-rdf` alongside `barnard59-n3` for the command's pipeline. Pass an absolute rules path because a relative value resolves from the installed command's pipeline definition. Use `--include all` to emit the input as well.

```sh
barnard59 n3 apply --rules "$PWD/rules.n3" < data.ttl
barnard59 n3 apply --rules "$PWD/rules.n3" --include all < data.ttl
```
