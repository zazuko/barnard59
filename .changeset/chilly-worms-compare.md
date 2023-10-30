---
"barnard59-core": major
---

This is breaking change for users creating and running pipeline programmatically. The `createPipeline`
function exported by the package now requires that an RDF/JS Environment is passed as an argument. 
A compatible environment which includes all necessary factories can be imported from the new 
`barnard59-env` package.

```diff
import { createPipeline, run } from 'barnard59-core'
import env from 'barnard59-env'

let pointer

await run(createPipeline(pointer, {
+ env  
})
```
