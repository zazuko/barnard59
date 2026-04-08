#  barnard59-n3

Applies N3 rules to datasets in barnard59 pipelines

## Install

```
npm install barnard59-n3 --save
```

## Exported steps

### `applyRules`

A step to apply N3 rules to datasets.

| Argument | Type | Description |
| -- | -- | -- |
| `rulesText` | `string` | rules in N3 format |
| `includeInput` | `boolean` | `true` to propagate input triples besides derived ones |

### Example: Applying N3 rules from file

```turtle
@prefix p: <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .

<#RuleStep> a p:Step;
  code:implementedBy [ a code:EcmaScriptModule;
    code:link <node:barnard59-n3/applyRules.js#default>
  ];
  code:arguments 
    [ code:name "rulesText" ; code:value "RULES_PATH"^^p:FileContents ] ,
    [ code:name "includeInput" ; code:value true ]
.
```

## Commands

Peer dependencies must be explicitly installed

```
npm i barnard59-base barnard59-formats barnard59-rdf
```

### apply

Reads standard input and applies the rules to it, writing derived triples to standard output.

```bash
cat data.ttl | barnard59 n3 apply --rules ./rules.n3
```

Adding the option `--include all`, also input triples are propagated to standard output.

```bash
cat data.ttl | barnard59 n3 apply --rules ./rules.n3 --include all
```
