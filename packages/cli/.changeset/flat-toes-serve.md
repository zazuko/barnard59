---
"barnard59": patch
---

Range of `barnard59-core` is now `1 - 2` because v2 includes a potential breaking change where variables with undefined values will cause pipelines to fail. Consumers can lock the version `barnard59-core` to `^1` in order to avoid fixing the pipeline right away
