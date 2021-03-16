#!/bin/bash

node bin/barnard59 run test/integration/one/pipeline.ttl -v \
--pipeline http://your-domain.ld.admin.ch/pipeline/mainCreateFile \
--output results.nt