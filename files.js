#!/usr/bin/env node
const program = require("commander");
const path = require("path");
const packageJson = require(path.join(process.cwd(), "./package.json"));
const { downloadDir, uploadDir } = require("./s3.js");

(async () => {
  program
    .command("upload <dir>")
    .description("upload snapshots into a s3 bucket")
    .option(
      "-n, --namespace [string]",
      `name of your service`,
      packageJson.name
    )
    .action(async (dir, cmdObj) => {
      const dirPath = dir.startsWith("/") ? dir : path.join(process.cwd(), dir);
      await uploadDir(dirPath, cmdObj.namespace);
    });

  program
    .command("download <dir>")
    .description("download snapshots from a s3 bucket")
    .option(
      "-n, --namespace [string]",
      `name of your service`,
      packageJson.name
    )
    .action(async (dir, cmdObj) => {
      const dirPath = dir.startsWith("/") ? dir : path.join(process.cwd(), dir);
      await downloadDir(dirPath, cmdObj.namespace);
    });

  await program.parseAsync(process.argv);
})();
