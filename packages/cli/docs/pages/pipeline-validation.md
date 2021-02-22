Operations of a package can be described in a `operations.ttl` file.
The metadata of the operations can be used to validate a pipeline.

## Matching Operations and Pipelines 

`Operation`s and `Step`s point to implementations.
The link of the implementations must be used to match a `Operation` to a `Step`.

### Step

The following example take from the [barnard59](https://github.com/zazuko/barnard59/blob/master/examples/fetch-json-to-ntriples.ttl) and shows all triples from a pipeline to the steps, and the code links: 

```turtle
<utc> a p:Pipeline, p:Readable ;
  p:steps <steps> .

<steps>
  p:stepList ( <fetch> <jsonldStructure> <parse> <serialize> ) .
  
<fetch> a p:Step ;
  code:implementedBy [
    code:link <node:barnard59-base#fetch.json> ;
    a code:EcmaScript
  ];
  code:arguments ("url"^^p:VariableName) .
```

The IRI `node:barnard59-base#fetch.json` is the identifier that must be used for the matching.
The following code snippet shows how to loop over all pipelines, steps of each individual pipeline and how to find the `identifier`:  

```javascript
input
  .has(ns.rdf.type, ns.p.Pipeline)
  .forEach(pipeline => {
    pipeline
      .out(ns.p.steps)
      .out(ns.p.stepList)
      .list()

    for (const step of steps) {
      const identifier = step
        .out(ns.code.implementedBy)
        .out(ns.code.link)
        .term
    }
  })
```

### Operation

The following example take from [barnard59-base](https://github.com/zazuko/barnard59-base/blob/master/operations.ttl) shows a description for an operation:

```turtle
<filter> a p:Operation, p:WritableObjectMode, p:ReadableObjectMode;
  rdfs:label "Filter";
  rdfs:comment "Forwards incoming chunks if they pass the filter function.";
  code:implementedBy [ a code:EcmaScript;
    code:link <node:barnard59-base#filter>
  ].
```

The IRI `node:barnard59-base#filter` is the identifier that must be used for the matching.
The following code snippet shows how to find the operation for a given `identifier`:

```javascript
const operation = input
  .namedNode(identifier)
  .in(ns.code.link)
  .in(ns.code.implementedBy)
```

## Readable/Writeable and ObjectMode

### Step List

Pipelines are just a chain of streams.
That makes it possible to check if the types of the streams are suitable to combine them.

The following streams can be connected:

- `Readable` -> `Writable`
- `ReadableObjectMode` -> `WritableObjectMode`

Every combination not in the list must throw an error.

### Pipeline

A pipeline itself is also represented as a stream.
That requires to have `Readable` or `Writable` interface depending on the first and last stream of the step list. 

The pipeline should have the same type if the first stream in the step list has one of the following types:

- `Writable`
- `WritableObjectMode`

The pipeline should have the same type if the last stream in the step list has one of the following types:

- `Readable`
- `ReadableObjectMode`
