#!/bin/bash

RAYCAST_EXTENSIONS_DIR=${RAYCAST_EXTENSIONS_DIR:-"../../raycast/extensions"}
EXTENSION_VERSION=$(git rev-parse --short HEAD)

echo "Publish $EXTENSION_VERSION to $RAYCAST_EXTENSIONS_DIR"

cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit
rm -rf "$RAYCAST_EXTENSIONS_DIR/extensions/sourcegraph"
rsync -rv \
    --exclude=.git \
    --exclude=.gitignore \
    --exclude=node_modules \
    --exclude=.scripts \
    --exclude=.github \
    ./ "$RAYCAST_EXTENSIONS_DIR/extensions/sourcegraph"

pushd "$RAYCAST_EXTENSIONS_DIR" || exit
git add .
git status
git commit -m "Publish raycast-sourcegraph@$EXTENSION_VERSION" -m "Version: https://github.com/bobheadxi/raycast-sourcegraph/commit/$EXTENSION_VERSION" --allow-empty
popd || exit
