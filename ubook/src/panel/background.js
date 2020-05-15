import React from "react";
import { Heading, HeadingLevel } from "baseui/heading";
import { RadioGroup, Radio } from "baseui/radio";
import { useAddonState } from "@storybook/api";
import { ADDON_ID, QUERY_PARAM_KEY_BG, CHANGE_BG } from "../const";

const main = require("../../.storybook/main");

const bgs = main.base.backgrounds;
const defaultBg = bgs.find((bg) => bg.default === true);
if (!defaultBg) {
  throw Error("One of the base.backgrounds must be default");
}

const baseThemes = main.base.themes;
const defaultTheme = baseThemes.find((theme) => theme.default === true);
if (!defaultTheme) {
  throw Error("One of the base.themes must be default");
}

const Background = ({ api, themeColors, parameters, path }) => {
  const [value, setValue] = useAddonState(
    `${ADDON_ID}/bg`,
    parameters.background ? parameters.background : defaultBg.name
  );
  React.useEffect(() => {
    setTimeout(() => {
      setValue(parameters.background);
      api.emit(CHANGE_BG, parameters.background);
      api.setQueryParams({
        [QUERY_PARAM_KEY_BG]: parameters.background,
      });
    }, 0);
  }, [parameters.background, path]);
  return (
    <HeadingLevel>
      <Heading styleLevel={5}>Background</Heading>
      <RadioGroup
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          api.emit(CHANGE_BG, e.target.value);
          api.setQueryParams({
            [QUERY_PARAM_KEY_BG]: e.target.value,
          });
        }}
        name="background"
      >
        {bgs.map((bg) => {
          const desc = themeColors[bg.value]
            ? `theme.colors.${bg.value}`
            : undefined;
          return (
            <Radio value={bg.name} key={bg.name} description={desc}>
              {`${bg.name} ${
                themeColors[bg.value] ? themeColors[bg.value] : bg.value
              }`}
            </Radio>
          );
        })}
      </RadioGroup>
    </HeadingLevel>
  );
};

export default Background;
