#!/bin/bash

#node bin/barnard59 run test/integration/one/pipeline.ttl -v \
#--pipeline http://your-domain.ld.admin.ch/pipeline/mainCreateFile \
#--output test/integration/one/actual_output.nt

#node bin/barnard59 run test/integration/three/pipeline.ttl -v \
#--output test/integration/three/actual_output.nt

node bin/barnard59 run test/integration/two/pipeline.ttl -v \
--pipeline http://ld.admin.ch/pipeline/metadata/mainCreateFile \
--output test/integration/two/actual_output.nt