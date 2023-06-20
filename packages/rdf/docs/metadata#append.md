
# Metadata Append operation

Say you have a `dataset_description.ttl` file containing:

```turtle
<http://example.org/test> a <http://schema.org/Dataset> .
```

Then a step:

```turtle
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<attachMetadata>
    a                  p:Step ;
    rdfs:label         "Attach metadata" ;
    code:implementedBy [ a         code:EcmaScriptModule ;
                         code:link <node:barnard59-rdf/metadata.js#append> ] ;
    code:arguments [
					   code:name "input"; code:value "../../metadata/dataset_description.ttl"
				   ],
				   [
					   code:name "dateCreated";
					   code:value  "2020-05-30";
				   ],
				   [
					   code:name "dateModified";
					   code:value  "TIME_NOW";
				   ] .

```

will append the contents of `dataset_description.ttl` to the stream, with new or updated `schema.dateModified` or `schema.dateCreated` properties.

```turtle
<http://example.org/test> <http://schema.org/dateModified> "2022-04-13T08:55:21.363Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<http://example.org/test> <http://schema.org/dateCreated> "2020-05-30"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
```

## Parameters

### input

The quads to append. Can be a file, a quad stream or an URL pointing to the resource.

## Optional parameters

### basepath

Sets the base path used to fetch the file.

### graph

The namedgraph used for the incoming metadata quads.

## Dataset Classes

The operation updates subjects with a type that's a 'well known dataset class', currently:

* http://rdfs.org/ns/void#Dataset
* http://www.w3.org/ns/dcat#Dataset

That will add or modify the `dcterms:created` and `dcterms:modified` properties, and:

* http://schema.org/Dataset
* https://cube.link/Cube

that will add or modify the `schema:dateCreated` and `schema:dateUpdated` properties.
  
## Named Date Literals

### TIME_NOW

The current time

### TIME_FILE_CREATION

The file creation time. Applies only to files

### TIME_FILE_MODIFICATION

The file modification time. Applies only to files
