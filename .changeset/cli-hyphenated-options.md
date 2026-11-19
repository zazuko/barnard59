---
"barnard59": patch
---

Pass hyphenated CLI options to custom pipelines under their declared variable names. Previously, the CLI dropped these values because Commander returned them under camelCase keys.
