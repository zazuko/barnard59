---
"barnard59": major
---

Monitoring flags moved before commands:

- `--enable-buffer-monitor`
- `--otel-debug`
- `--otel-metrics-exporter`
- `--otel-metrics-interval`
- `--otel-traces-exporter`

Update scripts like

```diff
-barnard59 run pipeline.ttl --enable-buffer-monitor
+barnard59 --enable-buffer-monitor run pipeline.ttl
```
