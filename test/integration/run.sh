#!/bin/bash

for testcase in "01" "02" "03"
do

actual="test/integration/$testcase/actual_output.nt"
expected="test/integration/$testcase/expected_output.nt"

if [[ "$testcase" == "01" ]]; then
    node bin/barnard59 run test/integration/01/pipeline.ttl \
    --pipeline http://your-domain.ld.admin.ch/pipeline/mainCreateFile \
    --output "$actual"
fi

if [[ "$testcase" == "02" ]]; then
    node bin/barnard59 run test/integration/02/pipeline.ttl \
    --pipeline http://ld.admin.ch/pipeline/metadata/mainCreateFile \
    --output "$actual"
fi

if [[ "$testcase" == "03" ]]; then
    node bin/barnard59 run test/integration/03/pipeline.ttl \
    --variable="inputDir=test/integration/03/input" \
    --variable="$actual" \
    --variable="mappingsDir=test/integration/03/mappings/*.json" \
    --pipeline=urn:pipeline:bar#Main
fi

if cmp -s "$actual" "$expected"; then
    printf "Test $testcase passed\n"
else
    printf "Test $testcase failed\n"
    printf 'The file "%s" is different than "%s"\n' "$actual" "$expected"
    exit 1
fi

done
