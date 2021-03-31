#!/bin/bash

for testcase in "01" "02" "03"
# Test 01
actual="test/integration/01/actual_output.nt"
expected="test/integration/01/expected_output.nt"

node bin/barnard59 run test/integration/01/pipeline.ttl -v \
--pipeline http://your-domain.ld.admin.ch/pipeline/mainCreateFile \
--output "$actual"

if cmp -s "$actual" "$expected"; then
    printf "Test 01 passed"
else
    printf 'The file "%s" is different than "%s"\n' "$actual" "$expected"
    exit 1
fi

# Test 02
actual="test/integration/02/actual_output.nt"
expected="test/integration/02/expected_output.nt"

node bin/barnard59 run test/integration/02/pipeline.ttl -v \
--pipeline http://ld.admin.ch/pipeline/metadata/mainCreateFile \
--output "$actual"

if cmp -s "$actual" "$expected"; then
    printf "Test 01 passed"
else
    printf 'The file "%s" is different than "%s"\n' "$actual" "$expected"
    exit 1
fi

# Test 03
actual="test/integration/03/actual_output.nt"
expected="test/integration/03/expected_output.nt"\

node bin/barnard59 run -v test/integration/03/pipeline.ttl \
--variable="inputDir=test/integration/03/input" \
--variable="$actual" \
--variable="mappingsDir=test/integration/03/mappings/*.json" \
--pipeline=urn:pipeline:bar#Main

if cmp -s "$actual" "$expected"; then
    printf "Test 01 passed"
else
    printf 'The file "%s" is different than "%s"\n' "$actual" "$expected"
    exit 1
fi
