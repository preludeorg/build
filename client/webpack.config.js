const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: {
        index: './client/js/main.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'client/templates/index.html',
        }),
        new CopyPlugin({
            patterns: [
                { from: "client/assets", to: "static/assets" },
                { from: "client/manifest.json", to: "static"}
            ],
        }),
    ],
    output: {
        filename: 'static/[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
};