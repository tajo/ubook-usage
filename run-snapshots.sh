#!/bin/bash

set -e

exit 1

echo "Downloading master snapshots from $S3_BUCKET_NAME S3 bucket"
echo
./files.js download artifacts
if [ $? -eq 1 ]; then exit 1; fi

echo
echo "Collecting stories and capturing snapshots"

if [ "$BUILDKITE_BRANCH" = "master" ]
then
  yarn ubook-snapshot --host="http://ubook-server" -u
  if [ $? -eq 1 ]; then exit 1; fi
  echo
  echo "Updating master snapshots in $S3_BUCKET_NAME S3 bucket"
  ./files.js upload artifacts
else
  yarn ubook-snapshot --host="http://ubook-server"
fi
