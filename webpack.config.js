const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/demos/pixi-lights/index.js',
  output: {
    path: path.resolve(__dirname, 'build/'),
    filename: 'webpack.bundle.js'
  },
  devServer: {
    contentBase: [path.join(__dirname, 'public'), path.join(__dirname, 'src')],
    compress: true,
    port: 3000
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                'env',
                {
                  targets: {
                    browsers: ['last 3 versions']
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
