#!/usr/bin/env node
const path = require("path");

require("@babel/register")({
  extends: path.join(__dirname, "./babel.js"),
});

const program = require("commander");
const packageJson = require("../package.json");
const vrt = require("./vrt.js");
const mainConfig = require("../.storybook/main");

const defaultGlob = mainConfig.stories
  .map((item) => item.replace(`${process.cwd()}/`, ""))
  .join(",");

program
  .option("-u, --update", "update mistmatched snapshots")
  .option("-o, --output [string]", "directory to save snapshots", "./artifacts")
  .option("-s, --stories [string]", `search glob for stories`, defaultGlob)
  .option("-b, --browsers [string]", "browsers used", "chromium,webkit,firefox")
  .option(
    "--debug",
    "turn off the headless mode and add 200ms delay to all actions"
  )
  .option("--scale <number>", "device scale", parseFloat, 2)
  .option(
    "--threshold <number>",
    "0 to 1 sensitivity for pixelmatch",
    parseFloat,
    0.1
  )
  .option("--host [string]", "host of Storybook server", "http://localhost")
  .option(
    "--port [number]",
    "port of Storybook server",
    (arg) => parseInt(arg, 10),
    51372
  )
  .version(packageJson.version)
  .parse(process.argv);

(async () => {
  await vrt({
    port: program.port,
    host: program.host,
    debug: program.debug,
    update: program.update,
    browsers: program.browsers.split(","),
    deviceScale: program.scale,
    stories: program.stories.split(","),
    output: program.output,
    threshold: program.threshold,
  });
})();
