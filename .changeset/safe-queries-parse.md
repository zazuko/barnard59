---
"barnard59-sparql": patch
---

`select` now parses the query with `sparqljs` and only accepts SELECT and ASK queries. SPARQL Update operations, including ones that contain `SELECT` or `ASK` in comments, are rejected.
