---
"barnard59-core": major
"barnard59": major
---

Improve logging

1. Added `trace` and `verbose` levels
2. Log pipeline debug info as `trace` (closes #149)
3. Change the semantics of CLI `--verbose` flag
   - default level (without flag) is `warn` 
   - `-v` -> `info`
   - `-vv` -> `debug`
   - `-vvv` -> `verbose`
   - `-vvvv` -> `trace`
4. Added new `--quiet` flag to disable all logging
5. Pipeline variables are logged to `verbose`
