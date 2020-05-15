export const PARAM_KEY = "baseweb";
export const ADDON_ID = "baseweb";
export const PANEL_ID = `${ADDON_ID}/panel`;

export const QUERY_PARAM_KEY_THEME = "baseTheme";
export const QUERY_PARAM_KEY_RTL = "rtl";
export const QUERY_PARAM_KEY_BG = "bg";

export const CHANGE_THEME = `${ADDON_ID}/change-theme`;
export const CHANGE_RTL = `${ADDON_ID}/change-rtl`;
export const CHANGE_BG = `${ADDON_ID}/change-bg`;

export const BREAKPOINT_NOT_SET = "__BREAKPOINT_NOT_SET";
export const STORYBOOK_IFRAME = "storybook-preview-iframe";
export const STORYBOOK_WRAPPER = "storybook-preview-wrapper";

export const IFRAME_STYLES = {
  margin: `auto`,
  transition: "width .3s, height .3s",
  position: "relative",
  borderLeft: `5px solid #333`,
  borderRight: `5px solid #333`,
  boxShadow:
    "0 0 100px 1000px rgba(0,0,0,0.5), 0 4px 8px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.08)",
};

export const WRAPPER_STYLES = {
  alignContent: "center",
  alignItems: "center",
  justifyContent: "center",
  justifyItems: "center",
  overflow: "auto",
  display: "grid",
  gridTemplateColumns: "100%",
  gridTemplateRows: "100%",
};
