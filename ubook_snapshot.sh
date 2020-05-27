#!/bin/bash

set -eo pipefail


# Polls for application health page
echo "Waiting for app at http://web-code-ubook-server:51372"

until $(curl --output /dev/null --silent --head --fail http://web-code-ubook-server:51372); do
  echo 'waiting...'
  sleep 1
done

echo "http://web-code-ubook-server:51372 is available"

npx ubook-snapshot -b chromium --host="http://web-code-ubook-server"
