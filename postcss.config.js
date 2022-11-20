import postcssPresetEnv from "postcss-preset-env";

export default {
  plugins: [
    postcssPresetEnv({
      stage: 1,
      features: {
        "custom-media-queries": {
          importFrom: "src/styles/core/breakpoints.css",
        },
      },
    }),
  ],
};
