#!/bin/bash

set -exo pipefail

echo "Building storybook instance and running server"

# run storybook instance
npx ubook -o dist
npx static-server dist --port 51372
