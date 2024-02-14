const path = require("path");

const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const { version } = require("./package.json");
const { preprocess } = require("./svelte.config");

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";

const local_tf4micro_kit = process.env.LOCAL_TF4MICRO_KIT;

module.exports = (env) => {
  const basePath = env.basePath || "";
  console.log(
    "=================================================================="
  );
  console.log(`= BUILDING FOR ${mode}`);
  console.log(`= BASE PATH: ${basePath}`);

  console.log(
    "=================================================================="
  );

  return {
    entry: {
      bundle: ["./src/main.js"],
    },
    resolve: {
      alias: {
        svelte: path.resolve("node_modules", "svelte"),
        "@assets": path.resolve(__dirname, "src", "assets"),
        "@scss": path.resolve(__dirname, "src", "scss"),
        "@motion": path.resolve(__dirname, "src/Trainer/src_motion"),
        "@speech": path.resolve(__dirname, "src/Trainer/src_speech"),
        "@vision": path.resolve(__dirname, "src/Trainer/src_vision"),
        "@fui": path.resolve(__dirname, "src/Trainer/app_mode/mode_fui"),

        "@template": path.resolve(__dirname, "src/src_template"),
        "motion-tf4micro-motion-kit": path.resolve(__dirname, "src/Trainer/src_motion/tf4micro-motion-kit"),
        "speech-tf4micro-motion-kit": path.resolve(__dirname, "src/Trainer/src_speech/tf4micro-motion-kit"),
        "vision-tf4micro-motion-kit": path.resolve(__dirname, "src/Trainer/src_vision/tf4micro-motion-kit"),
        //"tf4micro-motion-kit": path.resolve(__dirname, "src/Trainer/stores copy")
        "template-tf4micro-motion-kit": path.resolve(__dirname, "src/Trainer/src_template/tf4micro-motion-kit"),
      },
      extensions: [".mjs", ".js", ".svelte"],
      mainFields: ["svelte", "browser", "module", "main"],
    },
    output: {
      path: prod ? __dirname + "/dist" : __dirname + "/public/dev",
      filename: prod ? "[name].[contenthash].js" : "[name].js",
      chunkFilename: prod ? "[name].[id].[contenthash].js" : "[name].[id].js",
    },
    module: {
      rules: [
        // prod
        // ? {
        //     test: /\.(?:svelte|m?js)$/,
        //     include: [
        //       path.resolve(__dirname, 'src'),
        //       path.resolve(__dirname, 'node_modules', 'svelte'),
        //     ],
        //     use: {
        //       loader: 'babel-loader',
        //     },
        //   }
        // : {},
        {
          test: /\.(png|jpg|gif)$/i,
          type: "asset/resource",
        },
        {
          test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/,
          type: "asset/resource",
        },
        {
          test: /\.svelte$/,
          use: {
            loader: "svelte-loader",
            options: {
              emitCss: true,
              hotReload: true,
              preprocess,
            },
          },
        },
        {
          test: /\.(scss|sass|css)$/i,
          use: [
            /**
             * MiniCssExtractPlugin doesn't support HMR.
             * For developing, use 'style-loader' instead.
             * */
            prod ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                  includePaths: [
                    path.resolve(__dirname, "src", "scss", "theme"),
                    path.resolve(__dirname, "node_modules"),
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    mode,
    plugins: [
      new webpack.DefinePlugin({
        BASE_PATH: JSON.stringify(basePath),
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: `Gamba Labs`,
        template: "src/index.html",
      }),
      new MiniCssExtractPlugin({
        filename: prod ? "[name].[contenthash].css" : "[name].css",
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: "static", to: "static" }],
      }),
    ],
    devtool: prod ? "hidden-source-map" : "source-map",
  };
};
