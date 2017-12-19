const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const paths = {
   DIST: path.resolve(__dirname, 'dist'),
   SRC: path.resolve(__dirname, 'src'),
   JS: path.resolve(__dirname, 'src/app'),
}

module.exports = {
   devtool: 'source-map',
   entry: path.join(paths.JS, 'app.js'),
   output: {
      path: paths.DIST,
      filename: 'app.bundle.js'
   },
   plugins: [
      new HtmlWebpackPlugin({ template: path.join(paths.SRC, 'index.html') }),
      new ExtractTextPlugin('style.bundle.css')
   ],
   module: {
      rules: [{
         test: /\.(js|jsx)$/,
         exclude: /node_modules/,
         use: ['babel-loader']
      }, {
         test: /\.(scss|css)$/,
         loader: ExtractTextPlugin.extract({
            use: ['css-loader', 'sass-loader']
         })
      }, {
         test: /\.(png|jpg|gif)$/,
         use: ['file-loader']
      }]
   },
   devServer: {
      proxy: {
         '/api/**': {
            target: 'http://localhost:3000',
            secure: false
         }
      }
   }
}