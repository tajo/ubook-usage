import React from "react";
import { Heading, HeadingLevel } from "baseui/heading";
import { RadioGroup, Radio } from "baseui/radio";
import { useAddonState } from "@storybook/api";
import { ADDON_ID, QUERY_PARAM_KEY_THEME, BREAKPOINT_NOT_SET } from "../const";
const main = require("../../.storybook/main");

const breakpoints = main.base.breakpoints;

const baseThemes = main.base.themes;
const defaultTheme = baseThemes.find((theme) => theme.default === true);
if (!defaultTheme) {
  throw Error("One of the base.themes must be default");
}

const Breakpoints = ({ api, value, setValue, themeBreakpoints }) => (
  <HeadingLevel>
    <Heading styleLevel={5}>Breakpoint</Heading>
    <RadioGroup
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      name="breakpoint"
    >
      <Radio value={BREAKPOINT_NOT_SET} key={BREAKPOINT_NOT_SET}>
        Unset 100%
      </Radio>
      {breakpoints.map((breakpoint) => {
        const desc = themeBreakpoints[breakpoint.value]
          ? `theme.breakpoints.${breakpoint.value}`
          : undefined;
        return (
          <Radio
            value={String(breakpoint.value)}
            key={breakpoint.value}
            description={desc}
          >
            {`${breakpoint.name} ${
              themeBreakpoints[breakpoint.value]
                ? themeBreakpoints[breakpoint.value]
                : breakpoint.value
            }px`}
          </Radio>
        );
      })}
    </RadioGroup>
  </HeadingLevel>
);

export default Breakpoints;
