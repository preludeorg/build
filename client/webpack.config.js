const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
 entry: {
  index: './client/js/main.js'
 },
 plugins: [
   new HtmlWebpackPlugin({
       title: 'Operator',
       template: 'client/templates/index.html',
   }),
 ],
 output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist'),
 },
};