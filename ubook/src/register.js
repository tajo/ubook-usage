import React from "react";
import { addons } from "@storybook/addons";
import { ADDON_ID, PANEL_ID, PARAM_KEY } from "./const";
import Panel from "./panel/index";

addons.register(ADDON_ID, (api) => {
  addons.addPanel(PANEL_ID, {
    title: "Base Web",
    paramKey: PARAM_KEY,
    render: ({ active, key }) => <Panel key={key} active={active} api={api} />,
  });
});
