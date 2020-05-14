// helper functions to read/write into our s3 bucket
// snapshots are prefixed by the package.json/name (creates folders in the bucket)

const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const makeDir = require("make-dir");
const justRemove = require("just-remove");

console.log(process.env.CI);
console.log(process.env.BUILDKITE);
console.log(process.env.BUILDKITE_BRANCH);
console.log(process.env.BUILDKITE_PULL_REQUEST);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadFile = async (fileName, dirPath, serviceName) => {
  try {
    const result = await s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${serviceName}/${fileName}`,
        Body: await fs.promises.readFile(path.join(dirPath, fileName)),
      })
      .promise();
    console.log(`File ${fileName} uploaded successfully.`);
  } catch (err) {
    console.error(err);
  }
};

const deleteFile = async (key) => {
  try {
    const result = await s3
      .deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      })
      .promise();
    console.log(`File ${key} deleted.`);
  } catch (err) {
    console.error(err);
  }
};

const uploadDir = async (directory, serviceName) => {
  try {
    const dirents = await fs.promises.readdir(directory, {
      withFileTypes: true,
    });
    const files = dirents
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name);

    //first, purge bucket files that don't have local counterparts
    const list = await s3
      .listObjects({
        Bucket: process.env.AWS_BUCKET_NAME,
        Delimiter: "/",
        Prefix: `${serviceName}/`,
      })
      .promise();
    const keys = list.Contents.map((item) => item.Key);
    const toRemove = justRemove(
      keys,
      files.map((file) => `${serviceName}/${file}`)
    );
    await Promise.all(toRemove.map(deleteFile));

    // then upload the whole folder
    await Promise.all(
      files.map((file) => uploadFile(file, directory, serviceName))
    );
  } catch (e) {
    console.error(`Cannot read directory ${directory}`);
  }
};

const downloadFile = async (key, outputDir) => {
  try {
    const result = await s3
      .getObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      })
      .promise();
    const keyParts = key.split("/");
    const fileName = keyParts[keyParts.length - 1];
    const file = fs.createWriteStream(path.join(outputDir, fileName));
    const saveFile = await new Promise((resolve) => {
      file.write(result.Body, () => {
        file.end();
        resolve();
      });
    });
    console.log(`File ${key} downloaded successfully.`);
  } catch (err) {
    console.error(err);
  }
};

const downloadDir = async (directory, serviceName) => {
  try {
    const list = await s3
      .listObjects({
        Bucket: process.env.AWS_BUCKET_NAME,
        Delimiter: "/",
        Prefix: `${serviceName}/`,
      })
      .promise();
    await makeDir(directory);
    const keys = list.Contents.map((item) => item.Key);
    await Promise.all(keys.map((key) => downloadFile(key, directory)));
  } catch (e) {
    console.error(
      `Reading ${serviceName} folder from the s3 bucket ${process.env.AWS_BUCKET_NAME} failed.`
    );
  }
};

const deleteDir = async (directory, serviceName) => {
  try {
    const list = await s3
      .listObjects({
        Bucket: process.env.AWS_BUCKET_NAME,
        Delimiter: "/",
        Prefix: `${serviceName}/`,
      })
      .promise();
    await makeDir(directory);
    const keys = list.Contents.map((item) => item.Key);
    await Promise.all(keys.map((key) => downloadFile(key, directory)));
  } catch (e) {
    console.error(
      `Reading ${serviceName} folder from the s3 bucket ${process.env.AWS_BUCKET_NAME} failed.`
    );
  }
};

module.exports = {
  downloadDir,
  uploadDir,
};
