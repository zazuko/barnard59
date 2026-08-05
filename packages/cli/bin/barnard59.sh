#!/usr/bin/env sh

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
candidate="$script_dir/../barnard59/bin/barnard59.js"
if [ -f "$candidate" ]; then
  # found the local entrypoint, as installed with npx
  barnard59="$candidate"
else
  # try local resolution from CWD
  barnard59=$(node -e "console.log(require.resolve('barnard59/bin/barnard59.js'))" 2>/dev/null)
fi

# final global fallback (only if actually present)
if [ -z "$barnard59" ]; then
  global_root=$(npm root -g 2>/dev/null)
  candidate="$global_root/barnard59/bin/barnard59.js"
  [ -f "$candidate" ] && barnard59="$candidate" || barnard59=""
fi

[ -n "$barnard59" ] || { echo "Could not find barnard59/bin/barnard59.js" >&2; exit 1; }

# if tsx or ts-node exists in path, use them
if command -v tsx > /dev/null 2>&1
then
  node --import tsx --no-warnings "$barnard59" "$@"
elif command -v ts-node > /dev/null 2>&1
then
  # use ts-node
  node --loader ts-node/esm/transpile-only --no-warnings "$barnard59" "$@"
else
  # use plain node
  node "$barnard59" "$@"
fi
