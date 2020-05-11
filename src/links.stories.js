import React from "react";
import { linkTo } from "@storybook/addon-links";

export default {
  title: "Links",
};

export const First = () => (
  <button onClick={linkTo("Base Button", "Primary")}>
    Go to Base Button / Primary
  </button>
);
