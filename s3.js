// helper functions to read/write into our s3 bucket
// snapshots are prefixed by the package.json/name (creates folders in the bucket)

const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const serviceName = require("./package.json").name;
const makeDir = require("make-dir");
const justRemove = require("just-remove");

// check our s3 bucket and ubook user for details, AWS_ID and AWS_KEY are needed!
const BUCKET_NAME = "ubook-snapshots";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_KEY,
});

const uploadFile = async (fileName, dirPath, serviceName, bucketName) => {
  try {
    const result = await s3
      .upload({
        Bucket: bucketName,
        Key: `${serviceName}/${fileName}`,
        Body: await fs.promises.readFile(path.join(dirPath, fileName)),
      })
      .promise();
    console.log(`File ${fileName} uploaded successfully.`);
  } catch (err) {
    console.error(err);
  }
};

const deleteFile = async (key, bucketName) => {
  try {
    const result = await s3
      .deleteObject({
        Bucket: bucketName,
        Key: key,
      })
      .promise();
    console.log(`File ${key} deleted.`);
  } catch (err) {
    console.error(err);
  }
};

const uploadDir = async (directory, serviceName, bucketName) => {
  const dirPath = path.join(process.cwd(), directory);
  try {
    const dirents = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const files = dirents
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name);

    //first, purge bucket files that don't have local counterparts
    const list = await s3
      .listObjects({
        Bucket: bucketName,
        Delimiter: "/",
        Prefix: `${serviceName}/`,
      })
      .promise();
    const keys = list.Contents.map((item) => item.Key);
    const toRemove = justRemove(
      keys,
      files.map((file) => `${serviceName}/${file}`)
    );
    await Promise.all(toRemove.map((key) => deleteFile(key, bucketName)));

    // then upload the whole folder
    await Promise.all(
      files.map((file) => uploadFile(file, dirPath, serviceName, bucketName))
    );
  } catch (e) {
    console.error(`Cannot read directory ${directory}`);
  }
};

const downloadFile = async (key, outputDir, bucketName) => {
  try {
    const result = await s3
      .getObject({
        Bucket: bucketName,
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

const downloadDir = async (directory, serviceName, bucketName) => {
  try {
    const list = await s3
      .listObjects({
        Bucket: bucketName,
        Delimiter: "/",
        Prefix: `${serviceName}/`,
      })
      .promise();
    await makeDir(directory);
    const keys = list.Contents.map((item) => item.Key);
    await Promise.all(
      keys.map((key) => downloadFile(key, directory, bucketName))
    );
  } catch (e) {
    console.error(
      `Reading ${serviceName} folder from the s3 bucket ${bucketName} failed.`
    );
  }
};

const deleteDir = async (directory, serviceName, bucketName) => {
  try {
    const list = await s3
      .listObjects({
        Bucket: bucketName,
        Delimiter: "/",
        Prefix: `${serviceName}/`,
      })
      .promise();
    await makeDir(directory);
    const keys = list.Contents.map((item) => item.Key);
    await Promise.all(
      keys.map((key) => downloadFile(key, directory, bucketName))
    );
  } catch (e) {
    console.error(
      `Reading ${serviceName} folder from the s3 bucket ${bucketName} failed.`
    );
  }
};

(async () => {
  await uploadDir("./artifacts", serviceName, BUCKET_NAME);
  //await downloadDir("./artifacts2", serviceName, BUCKET_NAME);
})();
