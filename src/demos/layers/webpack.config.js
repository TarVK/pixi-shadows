const path = require("path");
const demoBuildDir = path.join(process.cwd(), "build", "demos", "layers");
module.exports = {
    mode: "development",
    entry: path.join(__dirname, "index.js"),
    output: {
        path: demoBuildDir,
        filename: "webpack.bundle.js"
    },
    devServer: {
        contentBase: [demoBuildDir, path.join(process.cwd(), "build")],
        compress: true,
        port: 3000
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "env",
                                {
                                    targets: {
                                        browsers: ["last 3 versions"]
                                    }
                                }
                            ]
                        ]
                    }
                }
            }
        ]
    }
};
