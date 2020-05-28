#!/bin/bash
set -m

echo "Building storybook instance and running server"

# run storybook instance
npx ubook -o dist
( npx static-server dist --port 51372 > /dev/null 2>&1 & )

# Polls for application health page
echo "Waiting for app at http://localhost:51372"

npx ubook-snapshot -b chromium
e=$? # save the return code
fg %1 # bring the static-server process to the foreground
exit $e # exit with the ubook-snapshot return code
