const namespace = require('@rdfjs/namespace')

const ns = {
  cube: namespace('https://cube.link/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  rdfs: namespace('http://www.w3.org/2000/01/rdf-schema#'),
  sh: namespace('http://www.w3.org/ns/shacl#'),
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

module.exports = ns
