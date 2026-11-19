---
"barnard59-graph-store": minor
---

Added `--allow-clear` option to clear the target graph with an empty PUT when the input contains no RDF quads. This takes precedence over `--allow-empty`. In JavaScript and pipeline steps, set `allowClear: true`.
