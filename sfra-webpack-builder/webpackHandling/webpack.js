const helper = require("../helper/helper");
const path = require("path");
const params = require("minimist")(process.argv.slice(2));

const envData = { watch: !!params.watch };
if (params.env) {
  if (Array.isArray(params.env)) {
    params.env.forEach((item) => {
      envData[item] = true;
    });
  } else {
    envData[params.env] = true;
  }
}

const webpack = require(helper.getNodeModulesFolder(envData, "webpack"));

let config;
if (params.config) {
  config = require(path.resolve(process.cwd(), params.config));
} else {
  config = require("../webpack.configtest");
}

const compiler = webpack(config(envData));

if (params.watch) {
  compiler.watch(
    {
      aggregateTimeout: 300,
      poll: undefined,
    },
    (err, stats) => {
      console.log(
        stats.toString({
          colors: true,
        })
      );
    }
  );
} else {
  compiler.run((err, stats) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(
      stats.toString({
        chunks: false, // Makes the build much quieter
        colors: true, // Shows colors in the console
      })
    );
    compiler.close((closeErr) => {
      if (closeErr) {
        console.error(closeErr);
      }
    });
  });
}
