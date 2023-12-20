#!/usr/bin/env bash

SCRIPT_PATH=$(dirname "$0")

# if ts-node exists in path
if command -v ts-node &> /dev/null
then
  # use ts-node
  node --loader ts-node/esm/transpile-only --no-warnings "$SCRIPT_PATH"/../barnard59/bin/barnard59.js "$@"
else
  # use plain node
  node "$SCRIPT_PATH"/../barnard59/bin/barnard59.js "$@"
fi
