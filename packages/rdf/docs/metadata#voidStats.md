
# Metadata voidStats operation

Say you have the following stream:

```turtle
@prefix ex: <https://example.org/> .

ex:Alice a ex:Person ;
    ex:name "Alice" .

ex:Bob a ex:Person ;
    ex:friendOf ex:Alice ;
    ex:name "Bob" .
```

Then a step:

```turtle
@prefix ex: <https://example.org/> .
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .

ex:step a p:Step ;
        code:implementedBy [
              a code:EcmaScriptModule ;
              code:link <node:barnard59-rdf/metadata.js#voidStats>
          ] ;
        code:arguments [ code:name "voidDatasetUri"; code:value "https://example.org/dataset" ],
        [ code:name "classPartitions"; code:value ( "https://example.org/Person" ) ],
        [ code:name "propertyPartitions"; code:value ( "https://example.org/friendOf" "https://example.org/name" ) ] .
```

will yield:

```turtle

@prefix ex: <https://example.org/> .
@prefix void: <http://rdfs.org/ns/void#> .

ex:Alice a ex:Person ;
         ex:name "Alice" .

ex:Bob a ex:Person ;
       ex:friendOf ex:Alice ;
       ex:name "Bob" .

ex:dataset a void:Dataset ;
           void:triples 5 ;
          void:entities 2 ;
          void:classPartition <https://example.org/dataset/classPartition/0> ;
          void:propertyPartition <https://example.org/dataset/propertyPartition/0>, <https://example.org/dataset/propertyPartition/1> .

<https://example.org/dataset/classPartition/0> void:entities 2 ;
                                               void:class ex:Person .

<https://example.org/dataset/propertyPartition/0> void:entities 1 ;
                                                  void:property ex:friendOf .

<https://example.org/dataset/propertyPartition/1> void:entities 2 ;
                                                  void:property ex:name .
```

## Parameters

### voidDatasetUri

The URI of the dataset

## Optional parameters

### classPartitions

A list of classes to include in the stats

### propertyPartitions

A list of properties to include in the stats

### includeTotals

Include the total number of entities and triples in the stats. Defaults to false

### graph

The named graph used by the stats
