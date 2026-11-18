---
name: barnard59-csvw
description: Use when locating and loading CSV data from a CSV on the Web mapping document in a Barnard59 pipeline.
---

# Fetch CSV data from CSVW metadata

## `fetch`

With `@prefix op: <https://barnard59.zazuko.com/operations/> .`, use `op:csvw\/fetch` as a readable source. For an explicit step, link to `<node:barnard59-csvw/fetch.js#default>`. It loads the mapping document, follows the resolved `csvw:url`, and emits CSV bytes. Set `csvw` to the mapping location. For a local file, use an absolute file URL such as `file:///path/to/mapping.json`. For a remote mapping, use its HTTP(S) URL.

```turtle
@prefix p: <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .
@prefix op: <https://barnard59.zazuko.com/operations/> .

<#fetch> a p:Pipeline, p:Readable ;
  p:variables [ p:variable [ a p:Variable; p:name "mapping" ] ] ;
  p:steps [ p:stepList (
    [ op:csvw\/fetch [ code:name "csvw"; code:value "mapping"^^p:VariableName ] ]
  ) ] .
```

The step starts the pipeline as a byte source. `csvw` names the mapping document, while its `csvw:url` names the data. The mapping itself can be loaded by a separate pipeline when it should also drive row conversion. The step uses a bundled CSVW context by default. Set the optional boolean `useRemoteCsvwContext` to true to use normal remote context loading. To map rows into quads, connect this byte source to the CSVW parser from `barnard59-formats` and pass the parsed mapping separately to that parser.
