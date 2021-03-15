## Frequently use functions with barnard59

To produce expected files, run:
`node bin/barnard59.js run test/integration/one/pipeline.ttl`
### Tested:
Test pipelines contain following modules:
* `node:fs#createReadStream`
* `node:fs#createWriteStream`

* `node:barnard59-formats#ntriples.serialize`
* `node:barnard59-formats#csvw.parse`
* `node:barnard59-formats#jsonld.parse`
* `node:barnard59-formats#n3.parse`

* `node:barnard59-base#concat.object`
* `node:barnard59-base#glob`
* `node:barnard59-base#filter`

* `node:barnard59-core#forEach`
* `node:barnard59-tdb#update`


### Not tested

* `node:barnard59-base#setGraph`
* `node:barnard59-base#flatten`
* `node:barnard59-base#json.parse`
* `node:barnard59-base#map`
* `node:barnard59-base#fetch`
* `node:barnard59-base#limit`

* `node:barnard59-graph-store#put`
* `node:barnard59-shell`
* `node:barnard59-rdf/cube.js#toObservation`
* `node:barnard59-http#get`
* `node:barnard59-http#fetch`
* `node:barnard59-px#parse`
* `node:barnard59-ftp#read`



One (lindas-pipeline)
* node:barnard59-base#map
* node:barnard59-base#concat.object
* node:barnard59-formats#ntriples.serialize
* node:barnard59-formats#n3.parse
* node:fs#createReadStream

Two (lindas-metadata)
* node:barnard59-formats#n3.parse
* node:barnard59-tdb#update
* node:barnard59-core#forEach
* node:barnard59-base#glob
* node:barnard59-base#concat.object
* node:fs#createReadStream

Three (isil)
* node:barnard59-base#concat.object
* node:barnard59-base#filter
* node:barnard59-base#glob
* node:barnard59-core#forEach
* node:barnard59-formats#ntriples.serialize
* node:barnard59-formats#csvw.parse
* node:barnard59-formats#jsonld.parse
* node:fs#createWriteStream
* custom code

