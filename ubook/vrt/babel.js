const findBabelConfig = require("find-babel-config");
const { file, config } = findBabelConfig.sync("./");

module.exports =
  file && config
    ? config
    : {
        plugins: [
          require("@babel/plugin-transform-flow-strip-types"),
          require("@babel/plugin-proposal-optional-chaining"),
          require("@babel/plugin-proposal-object-rest-spread"),
          require("@babel/plugin-syntax-dynamic-import"),
          require("@babel/plugin-syntax-import-meta"),
          [
            require("@babel/plugin-proposal-class-properties"),
            { loose: false },
          ],
          require("@babel/plugin-proposal-json-strings"),
        ],
        presets: [
          [
            require("@babel/preset-env"),
            {
              targets: {
                node: "10.6",
              },
              include: ["transform-block-scoping", "transform-destructuring"],
            },
          ],
          require("@babel/preset-react"),
        ],
      };
