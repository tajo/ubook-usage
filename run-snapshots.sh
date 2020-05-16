#!/bin/bash

set -u

exit_script () {
  cat .buildkite/prompt-update.yml | buildkite-agent pipeline upload
  exit 1
}

echo "Downloading master snapshots from $S3_BUCKET_NAME S3 bucket"
echo
yarn ubook-s3 download artifacts -b master
if [ $? -eq 1 ]; then exit_script; fi

echo
echo "Collecting stories and capturing snapshots"

if [ "$BUILDKITE_BRANCH" = "master" ]
then
  yarn ubook-snapshot --host="http://ubook-server" -u
  if [ $? -eq 1 ]; then exit_script; fi
  echo
  echo "Updating master snapshots in $S3_BUCKET_NAME S3 bucket"
  yarn ubook-s3 upload artifacts -b master
else
  yarn ubook-snapshot --host="http://ubook-server"
fi
if [ $? -eq 1 ]; then exit_script; fi
exit 0
