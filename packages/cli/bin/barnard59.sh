#!/usr/bin/env bash

# find local barnard59
barnard59=$(node -e "console.log(require.resolve('barnard59/bin/barnard59.js'))" 2> /dev/null)

if [ -z "$barnard59" ]
then
  # find global barnard59
  NODE_PATH=$(npm config get prefix)
  barnard59=$(node -e "console.log(require('path').join('$NODE_PATH', '/lib/node_modules/barnard59/bin/barnard59.js'))")
fi

if [ -z "$barnard59" ]
then
  echo "Could not find barnard59/bin/barnard59.js" >&2
  exit 1
fi

# if ts-node exists in path
if command -v ts-node &> /dev/null
then
  # use ts-node
  node --loader ts-node/esm/transpile-only --no-warnings "$barnard59" "$@"
else
  # use plain node
  node "$barnard59" "$@"
fi
