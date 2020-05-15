import React from "react";
import { Checkbox, STYLE_TYPE, LABEL_PLACEMENT } from "baseui/checkbox";
import { Heading, HeadingLevel } from "baseui/heading";
import { useAddonState } from "@storybook/api";
import { ADDON_ID, QUERY_PARAM_KEY_RTL, CHANGE_RTL } from "../const";

const Rtl = ({ api, parameters, path }) => {
  const [value, setValue] = useAddonState(`${ADDON_ID}/rtl`, false);
  React.useEffect(() => {
    setTimeout(() => {
      setValue(Boolean(parameters.rtl));
      api.emit(CHANGE_RTL, Boolean(parameters.rtl));
      api.setQueryParams({
        [QUERY_PARAM_KEY_RTL]: Boolean(parameters.rtl),
      });
    }, 0);
  }, [parameters.rtl, path]);
  return (
    <HeadingLevel>
      <Heading styleLevel={5}>Right to Left</Heading>
      <Checkbox
        checked={value}
        checkmarkType={STYLE_TYPE.toggle_round}
        onChange={(e) => {
          setValue(e.target.checked);
          api.emit(CHANGE_RTL, e.target.checked);
          api.setQueryParams({
            [QUERY_PARAM_KEY_RTL]: e.target.checked,
          });
        }}
        labelPlacement={LABEL_PLACEMENT.right}
      />
    </HeadingLevel>
  );
};

export default Rtl;
