#!/bin/bash
set -m


echo "Building storybook instance and starting static-server"

# build storybook
npx ubook -o dist

# start a static server
( npx static-server dist --port 51372 > /dev/null 2>&1 & )

exit_script () {
  cat .buildkite/prompt-update.yml | buildkite-agent pipeline upload
  fg %1 # bring the static-server process to the foreground
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
  yarn ubook-snapshot -b webkit -u
  if [ $? -eq 1 ]; then exit_script; fi
  echo
  echo "Updating master snapshots in $S3_BUCKET_NAME S3 bucket"
  yarn ubook-s3 upload artifacts -b master
else
  DEBUG=pw:browser* node ./node_modules/.bin/ubook-snapshot -b webkit
fi
if [ $? -eq 1 ]; then exit_script; fi
exit 0

e=$? # save the return code
fg %1 # bring the static-server process to the foreground
exit $e # exit with the ubook-snapshot return code
