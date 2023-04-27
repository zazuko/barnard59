---
"barnard59-core": major
---

Variables are now required by default and pipeline will throw when attempting to retrieve a variable which is undefined (fixes #62)

Pipeline authors can mark a variable `p:required false` to prevent an error from being thrown.
