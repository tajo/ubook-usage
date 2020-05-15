const playwright = require("playwright");
const path = require("path");
const globby = require("globby");
const del = require("del");
const kebabCase = require("just-kebab-case");
const remove = require("just-remove");
const fs = require("fs");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch");
const makeDir = require("make-dir");
const chalk = require("chalk");

const COMPARE_STATUS = {
  NEW: "NEW",
  MISMATCH: "MISMATCH",
  MISMATCH_DIMENSIONS: "DIMENSIONS",
  MATCH: "MATCH",
};

const compareImages = (screenshot, screenshotPath, threshold) => {
  let oldScreenshotFile = null;
  try {
    oldScreenshotFile = fs.readFileSync(screenshotPath);
  } catch (e) {
    return { status: COMPARE_STATUS.NEW };
  }
  const oldScreenshot = PNG.sync.read(oldScreenshotFile);
  const newScreenshot = PNG.sync.read(screenshot);
  const { width, height } = oldScreenshot;
  const diffImage = new PNG({ width, height });
  let mismatchedPixels = 0;
  try {
    mismatchedPixels = pixelmatch(
      oldScreenshot.data,
      newScreenshot.data,
      diffImage.data,
      width,
      height,
      {
        threshold,
      }
    );
  } catch (e) {
    return { status: COMPARE_STATUS.MISMATCH_DIMENSIONS };
  }
  if (mismatchedPixels === 0) {
    return { status: COMPARE_STATUS.MATCH };
  }
  return { status: COMPARE_STATUS.MISMATCH, diffImage };
};

const vrt = async (opts) => {
  let counterAll = 0;
  let counterMismatched = 0;
  let counterMatched = 0;
  let counterUpdated = 0;
  let counterNew = 0;
  let counterUnused = 0;
  let counterRemoved = 0;

  const storyPaths = await globby(opts.stories);
  const ARTIFACTS_PATH = path.join(process.cwd(), opts.output);
  await makeDir(ARTIFACTS_PATH);
  await del(path.join(ARTIFACTS_PATH, "_diff"));
  const oldArtifacts = fs.readdirSync(ARTIFACTS_PATH);
  const touchedArtifacts = [];

  console.log("");

  let stories = [];
  for (const storyPath of storyPaths) {
    const file = require(path.join(process.cwd(), storyPath));
    const title = file.default.title;
    const base = (file.default.parameters &&
      file.default.parameters.baseweb) || {
      theme: "Light Move",
      background: "Primary",
    };
    stories = [
      ...stories,
      ...Object.keys(file)
        .filter((storyName) => storyName !== "default")
        .map((storyName) => {
          return {
            id: `${kebabCase(title.toLowerCase())}--${kebabCase(storyName)}`,
            base,
          };
        }),
    ];
  }

  for (const browserType of opts.browsers) {
    const browser = await playwright[browserType].launch({
      headless: !opts.debug,
      slowMo: opts.debug ? 200 : undefined,
      args:
        browserType === "chromium"
          ? ["--no-sandbox", "--disable-setuid-sandbox"]
          : undefined,
    });
    const context = await browser.newContext({
      deviceScaleFactor: opts.deviceScale,
    });
    const page = await context.newPage();
    for (const story of stories) {
      counterAll++;
      const snapName = `snap-${story.id}-${browserType}.png`;
      touchedArtifacts.push(snapName);
      const queryParams = `&baseTheme=${story.base.theme}&bg=${
        story.base.background
      }${story.base.rtl ? "&rtl=true" : ""}`;
      await page.goto(
        `${opts.host}:${opts.port}/iframe.html?id=${story.id}${queryParams}`
      );
      const component = await page.$("#root>div");
      const screenshotPath = path.join(ARTIFACTS_PATH, snapName);
      const screenshot = await component.screenshot();
      const { status, diffImage } = await compareImages(
        screenshot,
        screenshotPath,
        opts.threshold
      );
      if (status === COMPARE_STATUS.NEW) {
        counterNew++;
        console.log(chalk.blue(`New snapshot ${snapName} saved.`));
        fs.writeFileSync(path.join(ARTIFACTS_PATH, snapName), screenshot);
      } else if (
        status === COMPARE_STATUS.MISMATCH ||
        status === COMPARE_STATUS.MISMATCH_DIMENSIONS
      ) {
        if (opts.update) {
          counterUpdated++;
          console.log(chalk.yellow(`Snapshot ${snapName} updated.`));
          fs.writeFileSync(path.join(ARTIFACTS_PATH, snapName), screenshot);
        } else {
          counterMismatched++;
          if (status === COMPARE_STATUS.MISMATCH) {
            console.log(
              chalk.red(
                `Snapshot ${snapName} mismatched. A diff image was created.`
              )
            );
            const diffPath = await makeDir(path.join(ARTIFACTS_PATH, "_diff"));
            fs.writeFileSync(
              path.join(diffPath, snapName),
              PNG.sync.write(diffImage)
            );
            if (process.env.CI) {
              console.log(
                `\u001B]1338;url="artifact://artifacts/_diff/${snapName}";alt="Screenshot Diff"\u0007`
              );
            }
          } else {
            console.log(
              chalk.red(`Snapshot ${snapName} mismatched in dimensions.`)
            );
          }
        }
      } else {
        counterMatched++;
        console.log(chalk.green(`Snapshot ${snapName} matched.`));
      }
    }
    await browser.close();
  }

  // unused snapshots
  for (const snapName of remove(oldArtifacts, touchedArtifacts)) {
    if (opts.update) {
      counterRemoved++;
      await del(path.join(ARTIFACTS_PATH, snapName));
      console.log(chalk.yellow(`Snapshot ${snapName} removed.`));
    } else {
      counterUnused++;
      console.log(
        `Snapshot ${snapName} is unused. Remove it by using -u flag.`
      );
    }
  }

  // end report
  console.log("");
  console.log(`${counterAll} snapshots compared.`);
  counterMatched &&
    console.log(chalk.green(`${counterMatched} snapshots matched.`));
  counterMismatched &&
    console.log(chalk.red(`${counterMismatched} snapshots mismatched.`));
  counterNew &&
    console.log(chalk.blue(`${counterNew} snapshots newly created.`));
  counterUpdated &&
    console.log(chalk.yellow(`${counterUpdated} snapshots updated.`));
  counterRemoved &&
    console.log(chalk.yellow(`${counterRemoved} snapshots removed.`));
  counterUnused && console.log(`${counterUnused} snapshots unused.`);

  if (counterMismatched) {
    process.exit(1);
  }
  process.exit(0);
};

module.exports = vrt;
