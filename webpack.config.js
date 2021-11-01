const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StringReplacePlugin = require('string-replace-webpack-plugin'); 
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const EventHooksPlugin = require('event-hooks-webpack-plugin');
const { PromiseTask } = require('event-hooks-webpack-plugin/lib/tasks');
const fs = require('fs-extra');

const PATHS = {
  source: path.join(__dirname, 'source'),
  static: path.join(__dirname, 'static'),
  build: path.join(__dirname, 'build'),
};

const getReplacements = (names = ['assets']) => {
  return names.map((name) => ({
    pattern: new RegExp(`@${name}`, 'gi'),
    replacement: () => path.join(__dirname, 'source', `${name}`)
  }));
};

const plugins = [
  new VueLoaderPlugin(),
  new MiniCssExtractPlugin({ filename: '[name]/styles.css' }),
  new ESLintPlugin({
    extensions: ['js', 'vue'],
    files: 'source',
  }),
  new EventHooksPlugin({
    beforeRun: new PromiseTask(async () => {
      await fs.remove(PATHS.build);
      await fs.copy(PATHS.static, PATHS.build);
    }),
  }),
];

const rules = [
  {
    enforce: 'pre',
    test: /\.(vue|html)$/,
    use: [{ loader: StringReplacePlugin.replace({ replacements: getReplacements() }) }],
  },
  {
    test: /\.vue$/,
    use: 'vue-loader',
  },
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: [{
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
        plugins: [
          '@babel/plugin-transform-runtime',
          '@babel/plugin-proposal-class-properties',
        ],
      },
    }],
  },
  {
    test: /\.less$/,
    exclude: /(font)\.less$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      'less-loader',
    ],
  },
  {
    test: /\.css$/i,
    use: ['style-loader', 'css-loader'],
  },
  {
    test: /(font)\.less$/,
    use: [
      { loader: 'style-loader', options: { injectType: 'lazyStyleTag', insert: 'html' } },
      'css-loader',
      'less-loader',
    ],
  },
  {
    test: /\.(png|jpg|gif|eot|svg|otf|ttf|woff|woff2)$/,
    use: {
      loader: 'url-loader',
      options: {
        esModule: false,
      },
    },
  },
];

module.exports = (env, argv) => ({
  mode: argv.mode,
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'vendors',
          chunks: 'initial',
          minChunks: 2,
        },
      },
      name: false,
    },
  },
  entry: {
    bg: path.resolve(__dirname, PATHS.source, 'bg', 'app.js'),
    content: path.resolve(__dirname, PATHS.source, 'content', 'app.js'),
    settings: path.resolve(__dirname, PATHS.source, 'settings', 'app.js'),
  },
  output: {
    path: PATHS.build,
    filename: '[name]/bundle.js',
  },
  resolve: {
    alias: {
      '@constants': path.resolve(__dirname, PATHS.source, 'constants.js'),
      '@utils': path.resolve(__dirname, PATHS.source, 'utils.js'),
      '@assets': path.resolve(__dirname, PATHS.source, 'assets'),
      vue$: path.resolve(__dirname, 'node_modules/vue/dist/vue.common.js'),
      vuex$: path.resolve(__dirname, 'node_modules/vuex/dist/vuex.js'),
    },
  },
  module: {
    rules,
  },
  plugins,
});
