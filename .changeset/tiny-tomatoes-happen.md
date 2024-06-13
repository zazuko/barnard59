---
"barnard59-csvw": minor
---

The package now includes a copy of the CSVW context to avoid rate limiting issues when frequently loading the context from the web. To force using the remote context, pass `useRemoteCsvwContext: true` to the `fetch` step options.
