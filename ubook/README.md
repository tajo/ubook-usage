<p align="center"><img width="35%" src="https://user-images.githubusercontent.com/1387913/78606097-9a7ecd80-7811-11ea-9e59-7723c684d206.png"><p>

**uBook is a zero configuration [Storybook](https://storybook.js.org/) and visual snapshot testing tool for users of [Base Web](https://github.com/uber/baseweb)** component library. It comes with multiple addons as [Accessibility](https://github.com/storybookjs/storybook/tree/master/addons/a11y), [Actions](https://github.com/storybookjs/storybook/tree/master/addons/actions), [Knobs](https://github.com/storybookjs/storybook/tree/master/addons/knobs) and [Links](https://github.com/storybookjs/storybook/tree/master/addons/links). It also has a **special Base Web addon** so you can switch between different themes, background colors, breakpoints and right to left direction:

<p align="center"><img width="75%" src="https://user-images.githubusercontent.com/1387913/78943146-0bbbbc00-7a70-11ea-83dd-43a060c5f6ab.png"><p>

Do you need more addons or change the default theme? The configuration is completely optional but possible and very flexible.

## Installation

```sh
yarn add ubook
```

There are also multiple peer dependencies that need to be present in your project (the place where you keep your stories):

```json
{
  "baseui": "^9.50.0",
  "react": "^16.12.0",
  "react-dom": "^16.12.0",
  "styletron-engine-atomic": "^1.0.0",
  "styletron-react": "^5.0.0"
}
```

You can install them with a single command:

```sh
yarn add baseui react react-dom styletron-engine-atomic styletron-react
```

## Start Storybook

```sh
npx ubook
```

## CLI Options

```
-p, --port [number]          [dev] Port to run Storybook
-x, --host [string]          [dev] Host to run Storybook
--smoke-test                 [dev] Exit after successful start
--ci                         [dev] CI mode (skip interactive prompts, don't open browser)
-o, --output-dir [dir-name]  [static] Directory where to store built files (enables static mode)
-w, --watch                  [static] Enable watch mode
-h, --help                   display help for command
```

## Run Visual Snapshot Tests

Visual snapshots are a great way to make sure that your components work and look as expected. `ubook-snapshot` finds all your stories, opens them in Chrome, Firefox and Safari and saves their screenshots into `./artifacts`. A subsequent run compares existing screenshots pixel by pixel and if there is a mismatch, you get an error and `./artifacts/_diff/*.png` is created.

```sh
npx ubook #storybook server needs to be running first
npx ubook-snapshot
```

There is no configuration needed but you can always customize through this hierarchy:

1. CLI options
2. `./ubook.config.js` (coming, so far `stories` field is respected)
3. stories parameters `ubook` - all stories in a file or single story, adapting storybook's addon configuration API (coming)

## CLI Options

```
-u, --update             update mistmatched snapshots
-o, --output [string]    directory to save snapshots (default: "./artifacts")
-s, --stories [string]   search glob for stories (default: "src/**/*.stories.js")
-b, --browsers [string]  browsers used (default: "chromium,webkit,firefox")
--debug                  turn off the headless mode and add 200ms delay to all actions
--scale <number>         device scale (default: 2)
--threshold <number>     0 to 1 sensitivity for pixelmatch (default: 0.1)
--host [string]          host of Storybook server (default: "http://localhost")
--port [number]          port of Storybook server (default: 51372)
-h, --help               display help for command
```

## Exports

This library is bundling together multiple addons and the main storybook lib:

- [@storybook/addon-a11y](https://github.com/storybookjs/storybook/tree/master/addons/a11y)
- [@storybook/addon-actions](https://github.com/storybookjs/storybook/tree/master/addons/actions)
- [@storybook/addon-knobs](https://github.com/storybookjs/storybook/tree/master/addons/knobs)
- [@storybook/addon-links](https://github.com/storybookjs/storybook/tree/master/addons/links)
- [@storybook/react](https://github.com/storybookjs/storybook/tree/master/app/react)

You can directly export their APIs as:

```js
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
```

We also re-export everything from the ubook, so you can do

```js
import { storiesOf } from "ubook";
import { action } from "ubook";
```

This might be helplful if you are enforcing the ESLint rule [no-extraneous-dependencies](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md).

## Configuration

By default, ubook assumes that all stories can be found in `./src/**/*.stories.js`. Expect an error if there is no `src` folder in your project.

If you use a different file structure you can modify it by creating `ubook.config.js`:

```js
module.exports = (config) => ({
  ...config,
  stories: ["stories/**/*.stories.js"],
});
```

`ubook.config.js` can be used to configure all aspects of Storybook. It's a superset of [.storybook/main.js](https://storybook.js.org/docs/configurations/overview/#main-configuration) and aims to make the Storybook's configuration less chaotic and centralized. **The list of all `config` options with default/example values:**

```js
{
  stories: ["src/**/*.stories.js"],
  // https://storybook.js.org/docs/configurations/options-parameter/
  options: {
    isFullscreen: false,
    showNav: true,
    showPanel: true,
    panelPosition: "bottom",
    sidebarAnimations: true,
    enableShortcuts: true,
    isToolshown: true,
    theme: {
      brandTitle: "uBook",
      brandUrl: "https://github.com/uber/ubook",
      brandImage: "/ubook-logo.svg",
    },
    selectedPanel: "baseweb/panel",
  },
  // you can add more 3rd party addons
  addons: [
    path.join(__dirname, "../dist/register.js"),
    "@storybook/addon-a11y",
    "@storybook/addon-actions",
    "@storybook/addon-knobs",
    "@storybook/addon-links",
  ],
  base: {
    // feel free to add your custom theme
    themes: [
      { name: "Light Move", value: LightThemeMove, default: true },
      { name: "Dark Move", value: DarkThemeMove, default: false },
      { name: "Light", value: LightTheme, default: false },
      { name: "Dark", value: DarkTheme, default: false },
    ],
    // first we do a lookup in the selected Base theme
    // the value can be also absolute: #F1F1F1 (string)
    backgrounds: [
      { name: "Primary", value: "backgroundPrimary", default: true },
      { name: "Secondary", value: "backgroundSecondary", default: false },
      { name: "Tertiary", value: "backgroundTertiary", default: false },
    ],
    // first we do a lookup in the selected Base theme
    // tthe value can be also absolute: 800 (number)
    breakpoints: [
      { name: "Small", value: "small", default: false },
      { name: "Medium", value: "medium", default: false },
      { name: "Large", value: "large", default: false },
    ],
  },
  // inject additional global styling for all previews
  previewCss: `body { margin: 2em; }`,
  // wrap all stories with a React component
  previewProvider: ({ children }) => (
    <div>
      <h1>Global Title</h1>
      {children}
    </div>
  )
}
```

### Babel

uBook looks for `babel.config.js` or `.babelrc` in the current working directory (typically the project root) and then recursively in all parent directories. If no babel config is found, the default one is used.

### Base Web Addon

You can set default theme, background, breakpoint or RTL for a specific stories only, `example.stories.js`:

```jsx
import React from "react";
import { Button } from "baseui/button";

export default {
  title: "My project",
  parameters: {
    baseweb: {
      theme: "Dark Move",
      background: "Secondary",
      breakpoint: "Medium",
      rtl: true,
    },
  },
};

export const Basic = () => (
  <Button onClick={() => alert("click")}>Button</Button>
);
```
