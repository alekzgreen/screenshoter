const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const PATHS = {
  source: path.join(__dirname, 'source'),
  build: path.join(__dirname, 'app'),
};

module.exports = (env) => {
  const mode = env.production ? 'production' : 'development';
  console.log(mode);
  return {
    mode,
    devtool: 'cheap-source-map',
    watch: true,
    optimization: {
      minimize: true,
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions:
            mode === 'development'
              ? {
                  compress: true,
                  mangle: false,
                  output: {
                    comments: false,
                    beautify: true,
                  },
                }
              : {
                  compress: {
                    drop_console: true,
                  },
                },
        }),
        new OptimizeCSSAssetsPlugin({}),
      ],
      splitChunks: {
        cacheGroups: {
          commons: {
            test(mod) {
             // Only node_modules are needed
             if (!mod.context.includes('node_modules')) {
               return false;
             }
             // But not node modules that contain these key words in the path
             if ([ 'firebase' ].some(str => mod.context.includes(str))) {
               return false;
             }
              return true;
            },
            name: 'vendors',
            chunks: 'all'
          },
        },
        name: false,
      },
    },
    entry: {
      bg: PATHS.source + '/bg/app.js',
      settings: PATHS.source + '/settings/app.js',
      popup: PATHS.source + '/popup/app.js',
      content: PATHS.source + '/content/app.js',
    },
    output: {
      path: PATHS.build,
      filename: '[name]/bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: 'vue-loader',
        },
        {
          enforce: 'pre',
          test: /\.(js|vue)$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
        },
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['lodash', '@babel/plugin-transform-runtime'],
            },
          },
        },
        {
          test: /\.less$/,
          use: ['vue-style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
        },
        {
          test: /\.(png|jpg|gif|eot|svg|otf|ttf|woff|woff2)$/,
          loader: 'url-loader',
          options: {
            limit: 500000,
          },
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new CleanWebpackPlugin(['app']),
      new CopyWebpackPlugin([{ from: 'static' }]),
      new MiniCssExtractPlugin({ filename: '[name]/styles.css' }),
      new LodashModuleReplacementPlugin({
        collections: true,
        paths: true,
      }),
    ],
  };
};
