## Concept

A pipeline is a way to extract, transform, and load data (ETL). barnard59 pipelines are described in RDF format.
More specifically, they use the [pipeline](https://pipeline.described.at/) and [code](https://code.described.at/) ontology.

A barnard59 pipeline consists of steps, where each step returns a [Stream](https://nodejs.org/api/stream.html).
The streams of all steps are combined via [`.pipe`](https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options).
The pipeline itself is also a stream.

Depending on the stream types of the first and last stream, the pipeline can be writable or readable.
If the pipeline is self-contained, a dummy readable interface is provided to handle events for end of processing and errors.

### Internals

The code to process pipelines makes heavy usage of [RDF Loaders](https://github.com/zazuko/rdf-native-loader) to create JavaScript objects and functions based on a RDF description.
For the steps, the [Code Ontology](https://code.described.at/) is used to point or define the code for each step.
The [RDF Code Loader](https://github.com/zazuko/rdf-native-loader-code) takes care of importing code referenced as IRIs or directly process literals as JavaScript code.

## Pipeline Definition

The following prefixes are used in the code segments of this section:

```turtle
@prefix code: <https://code.described.at/> .
@prefix p: <https://pipeline.described.at/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
```

### Pipeline

The pipeline itself must have a `rdf:type` of `p:Pipeline`.
Based on the interfaces of the first and the last step, the pipeline itself is a [Writable](https://nodejs.org/api/stream.html#stream_writable_streams) and/or [Readable](https://nodejs.org/api/stream.html#stream_readable_streams) stream.
Additional to the `p:Pipeline` `rdf:type`, `p:Writable` and/or `p:Readable` must be defined accordingly.
That can look like this:

```turtle
<#pipeline> a p:Pipeline, p:Writable, p:Readable .
```

**Note:** The type of the streams could be also detected during runtime or based on metadata for the streams, but that would required deeper understanding of the pipeline and steps structures.
To simplify handling of pipeline definitions without runtime data, the stream types are attached to the pipeline definition and errors are thrown in the runtime if they don't match.

### Step

A pipeline consists of one or more steps, which are actually factories which return streams.
Each step is linked with the previous one via [`.pipe`](https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options).
As this requires to process the steps in order, the steps must be provided as an RDF List.
This example shows a very simple pipeline which consists of two steps:

```turtle
<#pipeline> a p:Pipeline ;
  p:steps [
    p:stepList ( <#readFile> <#writeFile> )
  ] .
```

**Note:** With the two levels (`p:steps` and `p:stepList`) it's possible to use a known identifier (Blank Node with name or Named Node) for a step list and reference to it in multiple pipelines.
This is useful if pipelines share the same steps, but have different variables.

The step itself must have a `rdf:type` of `p:Step`.
The Code Ontology is used to point to the actual code.
This is done with the `code:implementedBy` property and code description with the `rdf:type` of `code:EcmaScript`.
The `code:link` points to the JavaScript code file.
`node:` IRIs can be used to use the Node.js resolve logic of `require` to find files and packages.
`file:` IRIs will be expanded to full paths.
This example uses the Node.js file system function to create a readable stream.
`input.txt` is used as the only parameter.

```turtle
<#readFile> a p:Step ;
  code:implementedBy [ a code:EcmaScript ;
    code:link <node:fs#createReadStream>
  ] ;
  code:arguments ( "input.txt" ) .
```

It's also possible to give the arguments as key value pairs like this:

```turtle
<#parseCsvw> a p:Step ;
  code:implementedBy [ a code:EcmaScript ;
    code:link <file:customStreamCode.js>
  ] ;
  code:arguments [
    p:name "url";
    p:value "http://example.org/"
  ], [
    p:name "method";
    p:value "POST"
  ] .
```

`customStreamCode.js` should export a function which returns a stream.
During the initialization of the pipeline the function is called with the arguments built based on `code:arguments`.
The built argument for this example would look like this:

```js
{
  url: 'http://example.org/',
  method: 'POST'
}
```

### Variables

Pipelines can have variables directly attached to the pipeline or injected from the runtime, like the cli tool.
The variables can be evaluated via a special RDF Datatype or in ES6 Literals.

#### Definition attached to the Pipeline

Variables attached to the pipeline are useful when steps, step lists or sub pipelines are reused.
The definition looks like this:

```turtle
<#pipeline> a p:Pipeline ;
  p:variables [
    p:variable [ a p:Variable ;
      p:name "filename" ;
      p:value "example.txt"
    ]
  ] .
```

#### Using Variables via Datatype

The values of the variable can be use via a literal with a `p:VariableName` datatype.
In the example below, the argument will be replaced with the value of the variable `filename`:

```turtle
<#readFile> a p:Step;
  code:implementedBy [ a code:EcmaScript ;
    code:link <node:fs#createReadStream>
  ] ;
  code:arguments ("filename"^^p:VariableName) .
```

#### Using Variables in Template Literals

Variables can be also used in Template Literals.
The variable values are injected with their corresponding name, like shown in the following example:

```turtle
<#readFile> a p:Step ;
  code:implementedBy [ a code:EcmaScript ;
    code:link <node:fs#createReadStream>
  ] ;
  code:arguments ( "${basePath}/input.txt"^^code:EcmaScriptTemplateLiteral ) .
```

#### Using Variables in ECMAScript Code

Variables are also injected into the context provided to ECMAScript code.
The context can be accessed in the standard JavaScript way using `this`.
The variables are attached in a `Set` as `this.variables`.
In the following example you can see how the variable `prefix` can be accessed in the JavaScript code:

```turtle
<#map> a p:Step ;
  code:implementedBy [ a code:EcmaScript ;
    code:link <node:barnard59-base#map>
  ] ;
  code:arguments ("""row => {
    return this.variables.get('prefix') + row
  }"""^^code:EcmaScript) .
```

### JavaScript Arguments

Part of the pipeline concept are JavaScript code arguments where describing a logic in a declarative way would be very complex, but is easy to code in one or few lines of JavaScript code.
Also for this usage the Code Ontology is used.
The [RDF Code Loader package](https://github.com/zazuko/rdf-native-loader-code) provides this functionality.
See the docs of the package for more details.

#### EcmaScript

Here is a small example for a step which is using the `barnard59-base#map` operation:

```turtle
<#map> a p:Step ;
  code:implementedBy [ a code:EcmaScript ;
    code:link <node:barnard59-base#map>
  ] ;
  code:arguments ("""row => {
    // replace all ö umlauts with oe
    return row.split('ö').join('oe')
  }"""^^code:EcmaScript) .
```

#### EcmaScript Template Literal

Also Template Literals are supported.
The defined variables can be used directly.
A typical use case are file name patterns, derivative from a variable value, like in the following example:

```turtle
<#readFile> a p:Step ;
  code:implementedBy [ a code:EcmaScript ;
    code:link <node:fs#createReadStream>
  ] ;
  code:arguments ( "${basePath}/input.txt"^^code:EcmaScriptTemplateLiteral ) .
```

## Writing valid pipeline

Writing a valid pipeline can be tedious task. Pipelines are a chain of streams, and those streams have to match.

To learn more about correctly matching those streams, go [here](pipeline-validation.md).

To automatically detect stream-matching errors, use [pipeline validator](https://github.com/zazuko/barnard59-pipeline-validation).
