---
"barnard59-graph-store": major
---

By default, Graph Store `put` now fails when the input contains no RDF quads. To keep skipping empty uploads successfully, pass `--allow-empty` in the CLI or set `allowEmpty: true` in JavaScript or a pipeline step.
