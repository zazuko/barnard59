---
"barnard59-validation": patch
---

Align validation with `barnard59 run` for pipeline definitions that use `code:imports`, operation shorthand, nested pipelines, or inline JavaScript. Check nested stages using their declared stream types and treat inline JavaScript as a step with unknown stream metadata.
