import React from "react";
import { Button, KIND } from "baseui/button";
import { Heading, HeadingLevel } from "baseui/heading";

export default {
  title: "Dark Theme",
  parameters: {
    baseweb: {
      theme: "Dark Move",
      background: "Secondary",
    },
  },
};

export const Primary = () => (
  <HeadingLevel>
    <Heading styleLevel={3}>Primary</Heading>
    <Button onClick={() => alert("click")}>Button</Button>
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
