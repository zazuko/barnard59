---
"barnard59-validation": patch
---

Report file read and RDF parse failures as validation errors. Keep piped stdout parseable as JSON by sending human-readable diagnostics to stderr. Recognize local `file:` code links and `.js` links backed by TypeScript sources, and update the sample pipelines to use current operation exports.
