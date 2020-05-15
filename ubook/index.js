#!/usr/bin/env node
const storybook = require("@storybook/react/standalone");
const program = require("commander");
const path = require("path");
const packageJson = require("./package.json");

program
  .version(packageJson.version)
  .option(
    "-p, --port [number]",
    "[dev] Port to run Storybook. 0 sets a random empty port.",
    parseInt,
    51372
  )
  .option("-x, --host [string]", "[dev] Host to run Storybook")
  .option("--smoke-test", "[dev] Exit after successful start")
  .option(
    "--ci",
    "[dev] CI mode (skip interactive prompts, don't open browser)"
  )
  .option(
    "-o, --output-dir [dir-name]",
    "[static] Directory where to store built files (enables static mode)"
  )
  .option("-w, --watch", "[static] Enable watch mode")
  .parse(process.argv);

process.env.NODE_ENV =
  process.env.NODE_ENV || (program.outputDir ? "production" : "development");

storybook({
  mode: program.outputDir ? "static" : "dev",
  staticDir: [path.join(__dirname, "./.storybook/public")],
  outputDir: program.outputDir
    ? path.join(process.cwd(), program.outputDir)
    : undefined,
  port: program.port === 0 ? undefined : program.port,
  host: program.host,
  watch: program.watch,
  smokeTest: program.smokeTest,
  ci: program.ci,
  configDir: path.join(__dirname, "./.storybook"),
});
