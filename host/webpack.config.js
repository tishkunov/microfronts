const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const path = require('path');

// URL для каждого микрофронтенда (используем env variables для продакшена)
const REACT_APP1_URL = process.env.REACT_APP1_URL || 'http://localhost:3001';
const REACT_APP2_URL = process.env.REACT_APP2_URL || 'http://localhost:3002';
const VUE_APP_URL = process.env.VUE_APP_URL || 'http://localhost:3003';

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production' || process.env.NODE_ENV === 'production';
  
  return {
  mode: argv.mode || (isProduction ? 'production' : 'development'),
  entry: './src/index.tsx',
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.vue'],
    alias: {
      vue: '@vue/runtime-dom',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_SENTRY_DSN': JSON.stringify(process.env.REACT_APP_SENTRY_DSN || ''),
      'process.env.REACT_APP_GA_TRACKING_ID': JSON.stringify(process.env.REACT_APP_GA_TRACKING_ID || ''),
      'process.env.REACT_APP_API_BASE_URL': JSON.stringify(process.env.REACT_APP_API_BASE_URL || ''),
    }),
    new ModuleFederationPlugin({
      name: 'host',
      filename: 'remoteEntry.js',
      exposes: {
        './shared': './src/shared/index',
        './eventBus': './src/shared/eventBus',
        './store': './src/shared/store',
        './mockData': './src/shared/mock-data',
      },
      remotes: {
        react_app1: `react_app1@${REACT_APP1_URL}/remoteEntry.js`,
        react_app2: `react_app2@${REACT_APP2_URL}/remoteEntry.js`,
        vue_app: `vue_app@${VUE_APP_URL}/remoteEntry.js`,
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
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
};

