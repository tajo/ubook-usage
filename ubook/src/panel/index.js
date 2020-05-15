import React from "react";
import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";
import { BaseProvider, LightTheme } from "baseui";
import { Block } from "baseui/block";
import { AddonPanel } from "@storybook/components";
import { useAddonState, useParameter, useStorybookState } from "@storybook/api";
import Theme from "./theme";
import Background from "./background";
import Breakpoints from "./breakpoints";
import Rtl from "./rtl";
import {
  ADDON_ID,
  PARAM_KEY,
  BREAKPOINT_NOT_SET,
  STORYBOOK_IFRAME,
  STORYBOOK_WRAPPER,
  IFRAME_STYLES,
  WRAPPER_STYLES,
  QUERY_PARAM_KEY_THEME,
  CHANGE_THEME,
} from "../const";
const main = require("../../.storybook/main");

const baseThemes = main.base.themes;
const defaultTheme = baseThemes.find((theme) => theme.default === true);
if (!defaultTheme) {
  throw Error("One of the base.themes must be default");
}

const breakpoints = main.base.breakpoints;

const engineKey = Symbol.for("styletron.engine");
const engine = (window[engineKey] = window[engineKey] || new Styletron());

const Panel = ({ active, api }) => {
  const { path } = useStorybookState();
  const parameters = useParameter(PARAM_KEY, {});

  const [themeValue, setThemeValue] = useAddonState(
    `${ADDON_ID}/theme`,
    parameters.theme ? parameters.theme : defaultTheme.name
  );
  React.useEffect(() => {
    // panel mounts before the preview iframe, so we need to defer this
    setTimeout(() => {
      setThemeValue(parameters.theme);
      api.emit(CHANGE_THEME, parameters.theme);
      api.setQueryParams({
        [QUERY_PARAM_KEY_THEME]: parameters.theme,
      });
    }, 0);
  }, [parameters.theme, path]);

  const defaultBreakpoint = parameters.breakpoint
    ? breakpoints.find((bp) => bp.name === parameters.breakpoint)
    : breakpoints.find((bp) => bp.default === true);
  const [breakpointValue, setBreakpointValue] = useAddonState(
    `${ADDON_ID}/breakpoint`,
    defaultBreakpoint ? defaultBreakpoint.value : BREAKPOINT_NOT_SET
  );
  const activeTheme = baseThemes.find((theme) => theme.name === themeValue)
    .value;

  React.useEffect(() => {
    const width =
      breakpointValue === BREAKPOINT_NOT_SET
        ? "100%"
        : activeTheme.breakpoints[breakpointValue]
        ? `${activeTheme.breakpoints[breakpointValue]}px`
        : `${breakpointValue}px`;
    const iframe = document.getElementById(STORYBOOK_IFRAME);
    const wrapper = document.getElementById(STORYBOOK_WRAPPER);
    if (!iframe || !wrapper) {
      throw new Error("Cannot find Storybook iframe or iframe wrapper");
    }
    Object.keys(IFRAME_STYLES).forEach((prop) => {
      iframe.style[prop] =
        breakpointValue === BREAKPOINT_NOT_SET ? null : IFRAME_STYLES[prop];
    });
    iframe.style.width = width;
    Object.keys(WRAPPER_STYLES).forEach((prop) => {
      wrapper.style[prop] =
        breakpointValue === BREAKPOINT_NOT_SET ? null : WRAPPER_STYLES[prop];
    });
  }, [breakpointValue]);

  React.useEffect(() => {
    setBreakpointValue(
      defaultBreakpoint ? defaultBreakpoint.value : BREAKPOINT_NOT_SET
    );
  }, [defaultBreakpoint, path]);

  return (
    <AddonPanel active={active}>
      <StyletronProvider value={engine}>
        <BaseProvider theme={LightTheme}>
          <Block margin="scale400" display="flex" flexWrap="wrap">
            <Block padding="scale600">
              <Theme api={api} value={themeValue} setValue={setThemeValue} />
            </Block>
            <Block padding="scale600">
              <Background
                api={api}
                themeColors={activeTheme.colors}
                parameters={parameters}
                path={path}
              />
            </Block>
            <Block padding="scale600">
              <Breakpoints
                api={api}
                value={breakpointValue}
                setValue={setBreakpointValue}
                themeBreakpoints={activeTheme.breakpoints}
              />
            </Block>
            <Block padding="scale600">
              <Rtl api={api} parameters={parameters} path={path} />
            </Block>
          </Block>
        </BaseProvider>
      </StyletronProvider>
    </AddonPanel>
  );
};

export default Panel;
