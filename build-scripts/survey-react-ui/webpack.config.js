"use strict";

const webpackCommonConfigCreator = require("../webpack.common");
const { merge } = require("webpack-merge");
const packageJson = require("./package.json");
const path = require("path");

const config = {
  externals: {
    react: {
      root: "React",
      commonjs2: "react",
      commonjs: "react",
      amd: "react"
    },
    "react-dom": {
      root: "ReactDOM",
      commonjs2: "react-dom",
      commonjs: "react-dom",
      amd: "react-dom"
    },
    "survey-core": {
      root: "Survey",
      commonjs2: "survey-core",
      commonjs: "survey-core",
      amd: "survey-core"
    }
  },
};

module.exports = function (options) {
  options.platform = "react-ui";
  options.libraryName = "SurveyReact";
  options.tsConfigFile = path.resolve(__dirname, "./tsconfig.json")
  return merge(webpackCommonConfigCreator(options, packageJson), config);
}
