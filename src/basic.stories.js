import React from "react";
import { Button, KIND } from "baseui/button";
import { Heading, HeadingLevel } from "baseui/heading";
import { action } from "@storybook/addon-actions";

export default {
  title: "Base Button",
};

export const Primary = () => (
  <HeadingLevel>
    <Heading styleLevel={3}>Primary</Heading>
    <Button onClick={action("button-click")}>Buttonb</Button>
  </HeadingLevel>
);

export const Secondary = () => (
  <HeadingLevel>
    <Heading styleLevel={3}>Secondary</Heading>
    <Button kind={KIND.secondary} onClick={() => alert("click")}>
      Button
    </Button>
  </HeadingLevel>
);
