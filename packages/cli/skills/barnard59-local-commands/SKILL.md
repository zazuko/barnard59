---
name: barnard59-local-commands
description: Use when exposing a local Barnard59 pipeline as a named CLI subcommand through manifest.ttl, including pipeline selection, command options, and boolean switches.
---

# Barnard59 local commands

## Register a command

Install `barnard59` and the pipeline's step packages in the project. The CLI looks for `manifest.ttl` beside the nearest `package.json` above the working directory. For a private project, use its package name as the command group. A leading `barnard59-` is stripped. For example, both `local-tools` and `barnard59-local-tools` give the group `local-tools`.

For example, set the name and version in the project's `package.json`.

```json
{
  "name": "local-tools",
  "version": "1.0.0",
  "private": true
}
```

Add a `b59:CliCommand` resource to the root `manifest.ttl`. Replace the example source with the absolute path to your pipeline.

```turtle
@prefix b59: <https://barnard59.zazuko.com/vocab#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<urn:local-tools:command:greet> a b59:CliCommand ;
  b59:command "greet" ;
  b59:source "/absolute/path/to/local-tools/pipeline/greet.ttl" ;
  b59:pipeline <urn:local-tools:pipeline:greet> ;
  rdfs:label "Print a greeting" .
```

Use a quoted Node-resolvable specifier for `b59:source`. The CLI resolves it from its own module, so `"./pipeline/greet.ttl"` points into the CLI installation. For an ambiguous pipeline file, supply the full pipeline IRI with `b59:pipeline`. A single unambiguous root can be selected automatically. The manifest label supplies the help description.

For a portable source, put the manifest and pipeline in an installed `barnard59-<group>` package and use a specifier such as `"barnard59-local-tools/pipeline/greet.ttl"`. A local workspace package can serve the same role as a published package. If that package defines `exports`, expose `./manifest.ttl` and `./package.json` for discovery, plus the pipeline subpaths. [Extend barnard59 CLI](https://data-centric.zazuko.com/docs/workflows/how-to/extend-banard59-cli/).

## Declare command options

Declare options on the selected pipeline under `p:variables` and `p:variable`. The CLI uses `p:name` as the option name and `rdfs:label` as its optional help text. A regular option takes a value and is required by default. Set `p:required false` to make it optional or provide a literal `p:value` as its default.

Use the Turtle boolean `b59:flag true` for a valueless switch and `p:required false` to make the switch optional. When supplied, the switch passes the string `"true"` to the pipeline. When omitted, the pipeline uses its `p:value`, if set. In JavaScript, compare the flag value with `"true"` so that the default `"false"` is handled correctly.

For example, place this pipeline in `pipeline/greet.ttl`.

```turtle
@prefix b59: <https://barnard59.zazuko.com/vocab#> .
@prefix code: <https://code.described.at/> .
@prefix p: <https://pipeline.described.at/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<urn:local-tools:pipeline:greet> a p:Pipeline, p:Readable ;
  p:variables [
    p:variable
      [ a p:Variable ; p:name "person" ; p:value "world" ; rdfs:label "Person to greet" ],
      [ a p:Variable ; p:name "upper-case" ; p:required false ; p:value "false" ;
        b59:flag true ; rdfs:label "Print in uppercase" ]
  ] ;
  p:steps [ p:stepList (
    [ a p:Step ;
      code:implementedBy [ a code:EcmaScriptModule ; code:link <./greet.mjs#default> ] ;
      code:arguments ("person"^^p:VariableName "upper-case"^^p:VariableName)
    ]
  ) ] .
```

Place the step implementation in `pipeline/greet.mjs`.

```js
import { Readable } from 'node:stream'

export default function (person, upperCase) {
  const greeting = `Hello, ${person}!`
  return Readable.from([upperCase === 'true' ? greeting.toUpperCase() : greeting])
}
```

Run these commands from the project root to verify discovery and option handling.

```sh
npx barnard59 local-tools greet --help
npx barnard59 local-tools greet
npx barnard59 local-tools greet --person Ada --upper-case
```

Help should list `--person <person>` and `--upper-case`. The two invocations should print `Hello, world!` and `HELLO, ADA!` respectively.
