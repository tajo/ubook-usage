import React from "react";

import { withA11y } from "@storybook/addon-a11y";

export default {
  title: "A11yOk",
  decorators: [withA11y],
};

export const accessible = () => <button>Accessibleeee button</button>;

export const inaccessible = () => (
  <button style={{ backgroundColor: "red", color: "darkRed" }}>
    Inaccessible button
  </button>
);
