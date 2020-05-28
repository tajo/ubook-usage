#!/bin/bash
set -m

echo "Building storybook instance and running server"

# run storybook instance
npx ubook -o dist
npx static-server dist --port 51372 &

# Polls for application health page
echo "Waiting for app at http://localhost:51372"

until $(curl --output /dev/null --silent --head --fail http://localhost:51372); do
  echo 'waiting...'
  sleep 1
done

echo "http://localhost:51372 is available"

npx ubook-snapshot -b chromium

fg %1
