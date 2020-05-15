import React from "react";
import { BaseProvider } from "baseui";
import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";
import addons from "@storybook/addons";
import { getQueryParams } from "@storybook/client-api";
import {
  CHANGE_THEME,
  CHANGE_RTL,
  CHANGE_BG,
  QUERY_PARAM_KEY_THEME,
  QUERY_PARAM_KEY_RTL,
  QUERY_PARAM_KEY_BG,
} from "./const";

const main = require("../.storybook/main");
const baseThemes = main.base.themes;
const defaultTheme = baseThemes.find((theme) => theme.default === true);
if (!defaultTheme) {
  throw Error("One of the base.themes must be default");
}

const baseBgs = main.base.backgrounds;
const PreviewProvider = main.previewProvider;
const defaultBg = baseBgs.find((bg) => bg.default === true);
if (!defaultBg) {
  throw Error("One of the base.background must be default");
}

//This file is re-invoked in HMR, preserve engine across re-render
const engineKey = Symbol.for("styletron.engine");
const engine = (window[engineKey] = window[engineKey] || new Styletron());

const Providers = ({ children, channel }) => {
  // theme state
  const urlTheme = baseThemes.find(
    (theme) => theme.name === getQueryParams()[QUERY_PARAM_KEY_THEME]
  );
  const [theme, setTheme] = React.useState(
    urlTheme ? urlTheme.value : defaultTheme.value
  );

  // bg state
  const urlBg = baseBgs.find(
    (bg) => bg.name === getQueryParams()[QUERY_PARAM_KEY_BG]
  );
  const [bg, setBg] = React.useState(urlBg ? urlBg.value : defaultBg.value);

  const updateTheme = (themeName) => {
    setTheme(baseThemes.find((t) => t.name === themeName).value);
  };

  const updateRtl = (val) => {
    if (val === true) {
      document.dir = "rtl";
    } else {
      document.dir = "ltr";
    }
  };

  const updateBackground = (name) => {
    const value = name ? baseBgs.find((bg) => bg.name === name).value : bg;
    setBg(value);
  };

  React.useEffect(() => {
    document.body.style.background = theme.colors[bg] ? theme.colors[bg] : bg;
  }, [bg, theme]);

  React.useEffect(() => {
    channel.on(CHANGE_THEME, updateTheme);
    channel.on(CHANGE_RTL, updateRtl);
    channel.on(CHANGE_BG, updateBackground);
    if (getQueryParams()[QUERY_PARAM_KEY_RTL]) {
      updateRtl(true);
    }
    return function cleanup() {
      channel.removeListener(CHANGE_THEME, updateTheme);
      channel.removeListener(CHANGE_RTL, updateRtl);
      channel.removeListener(CHANGE_BG, updateBackground);
    };
  });
  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={theme}>
        {PreviewProvider ? (
          <PreviewProvider>{children}</PreviewProvider>
        ) : (
          children
        )}
      </BaseProvider>
    </StyletronProvider>
  );
};

const styleDecorator = (story, context) => {
  const Component = story;
  const channel = addons.getChannel();
  return (
    <Providers channel={channel}>
      <Component />
    </Providers>
  );
};

export default styleDecorator;
