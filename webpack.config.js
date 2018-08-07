const path = require('path');
const name = 'pixi-shadows';

module.exports = [{
  mode: 'development',
  entry: path.join(__dirname, 'src', 'shadows', "index.js"),
  output: {
    path: path.join(__dirname, 'build', 'shadows', 'client'),
    filename: name+'.js',
    library: name,
    libraryTarget: 'umd',
    umdNamedDefine: true
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
},{
  mode: 'development',
  entry: path.join(__dirname, 'src', 'shadows', "index.js"),
  target: 'node',
  output: {
    path: path.join(__dirname, 'build', 'shadows', 'node'),
    filename: name+'.js',
    library: name,
    libraryTarget: 'umd',
    umdNamedDefine: true
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
}];
