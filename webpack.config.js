const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/frontend/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.frontend.json'
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/frontend'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/frontend/public/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'src/frontend/public'),
    },
    compress: true,
    port: 3000,
    hot: true,
  },
};
