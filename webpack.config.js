const {
  ContextReplacementPlugin,
  HotModuleReplacementPlugin,
  DefinePlugin,
  ProgressPlugin,
  optimize: {
    CommonsChunkPlugin,
    UglifyJsPlugin,
    ModuleConcatenationPlugin
  }
} = require('webpack');

const path = require('path');
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { AotPlugin } = require('@ngtools/webpack');

function root(__path = '.') {
  return path.join(__dirname, __path);
}

function webpackConfig(options) {

  const PORT = options.PORT || 3000;
  const ENV = options.ENV || 'development';
  const AOT = options.AOT === 'true' || options.AOT === true;
  const TEST = ENV === 'test';
  const HMR = ENV === 'development';
  const PROD = ENV === 'production';

  const config = {
    cache: true,
    devtool: PROD ? false : 'source-map',
    entry: {
      main: root('app/main.ts'),
      polyfills: root('app/polyfills.ts'),
      styles: root('app/styles/index.styl')
    },
    output: {
      path: root('dist'),
      publicPath: '',
      filename: '[name].js',
      sourceMapFilename: '[name].map',
      chunkFilename: '[id].chunk.js'
    },
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
          loader: 'url-loader',
          options: {
            limit: 10000
          }
        },
        {
          test: /\.styl$/,
          use: ExtractTextPlugin.extract([
            {
              loader: 'css-loader',
              options: {
                alias: {
                  "../fonts": '../public/fonts',
                  "../imgs": '../public/imgs'
                }                ,
                minimize: PROD
              }
            },
            {
              loader: 'postcss-loader',
              options: { }
            }
          ])
        },
        // The component css files are raw-loaded to work with the angular2-template-loader
        {
          test: /\.component\.css$/,
          use: ['raw-loader']
        },
        {
          test: /\.(html)$/, 
          use: ['raw-loader'],
        },
        {
          test: /\.ts?$/,
          use: AOT ? [
            {
              loader: '@ngtools/webpack',
            }
          ] : [
            {
              loader: 'awesome-typescript-loader',
              options: {
                  module: 'es2015' 
              }
            },
            'angular-router-loader',
            'angular2-template-loader'
          ]
        },        
      ]
    },
    plugins: [
      new ExtractTextPlugin('styles.css'),
      new DefinePlugin({
        'ENV': JSON.stringify(ENV)
      }),
      new ProgressPlugin(),
      new ContextReplacementPlugin(
        /angular(\\|\/)core(\\|\/)@angular/,
        root()
      ),
      new HtmlWebpackPlugin({
        template: 'app/index.html',
        chunksSortMode: (c1, c2) => {
          const orders = ['manifest', 'styles', 'polyfills', 'vendor', 'main'];
          return orders.indexOf(c1.names[0]) - orders.indexOf(c2.names[0]);
        },       
      }),      
      new CopyWebpackPlugin([{
        from: 'app/public',
        to: ''
      }]),
    ],
    resolve: {
      extensions: ['.ts', '.js', '.json'],
      mainFields: ["webpack", "browser", "module", "main"],
      plugins: [ new TsConfigPathsPlugin() ]
    },
    devServer: {
      contentBase: './app/public',
      host: '0.0.0.0',
      port: PORT,
      hot: HMR,
      inline: HMR,
      historyApiFallback: true
    },
    node: {
      global: true,
      process: true,
      Buffer: false,
      crypto: 'empty',
      module: false,
      clearImmediate: false,
      setImmediate: false,
      clearTimeout: true,
      setTimeout: true
    }
  };

  // Deactivate common chunks for testing
  if (!TEST) {
    config.plugins.push(
      new CommonsChunkPlugin({
        name: 'vendor',
        chunks: ['main'],
        minChunks: (module) => module.resource && module.resource.startsWith(root('node_modules') )
      }),
      new CommonsChunkPlugin({ 
        name: 'manifest'
      })
    );
  }

  // Production specific plugins
  if (PROD) {
    config.plugins.push(
      new UglifyJsPlugin({
        mangle: {
          screw_ie8 : true,
        },
        compress: {
          screw_ie8: true,
          warnings: false
        },
        sourceMap: true,
        comments: false
      })
    );
    config.plugins.push(
      new ModuleConcatenationPlugin()
    );
  }

  // aot specific plugin
  if (AOT) {
    config.plugins.push(
       new AotPlugin({
        tsConfigPath: root('tsconfig.json'),
        entryModule: root('app/src/app.module#AppModule')
      })
    );
  }

  // hmr specific plugin
  if (HMR) {
    config.plugins.push(
      new HotModuleReplacementPlugin()
    );
  }

  return config;
}

// Export
module.exports = webpackConfig;
