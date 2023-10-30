---
"barnard59-graph-store": minor
"barnard59-validation": minor
"barnard59-formats": minor
"barnard59-sparql": minor
"barnard59-csvw": minor
"barnard59": minor
"barnard59-test-support": patch
"barnard59-test-e2e": patch
---

Removed dependency on any RDF/JS Environment. The CLI provides it at runtime to ensure that steps
use the same factories. Step implementors are encouraged to use the environment provided by the
barnard59 runtime insead of importing directly.

```diff
-import rdf from 'rdf-ext'

export function myStep() {
- const dataset = rdf.dataset()
+ const dataset = this.env.dataset()

  return rdf.dataset().toStream()
}
```
