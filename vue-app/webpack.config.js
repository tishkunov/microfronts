const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const path = require('path');

const HOST_URL = process.env.HOST_URL || 'http://localhost:3000';

module.exports = {
  mode: 'development',
  entry: './src/bootstrap.ts',
  devServer: {
    port: 3003,
    historyApiFallback: true,
    hot: true,
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      vue: '@vue/runtime-dom',
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new ModuleFederationPlugin({
      name: 'vue_app',
      filename: 'remoteEntry.js',
      remotes: {
        host: `host@${HOST_URL}/remoteEntry.js`,
      },
      exposes: {
        './AdminApp': './src/components/AdminPanel.vue',
      },
      shared: {
        vue: {
          singleton: true,
          requiredVersion: '^3.3.8',
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};

