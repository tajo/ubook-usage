import React from "react";
import { Heading, HeadingLevel } from "baseui/heading";
import { RadioGroup, Radio } from "baseui/radio";
import { QUERY_PARAM_KEY_THEME, CHANGE_THEME } from "../const";
const main = require("../../.storybook/main");

const baseThemes = main.base.themes;

const Theme = ({ api, value, setValue }) => (
  <HeadingLevel>
    <Heading styleLevel={5}>Theme</Heading>
    <RadioGroup
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        api.emit(CHANGE_THEME, e.target.value);
        api.setQueryParams({
          [QUERY_PARAM_KEY_THEME]: e.target.value,
        });
      }}
      name="theme"
    >
      {baseThemes.map((theme) => (
        <Radio value={theme.name} key={theme.name}>
          {theme.name}
        </Radio>
      ))}
    </RadioGroup>
  </HeadingLevel>
);

export default Theme;
