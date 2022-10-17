const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'development',
    resolve: {
        modules: [
            path.resolve(__dirname, '..', 'node_modules'),
            path.resolve(__dirname, 'js')
        ]
    },
    entry: {
        index: './client/js/main.js',
        serviceworker: {import: './client/serviceworker.js', filename: '[name].js'},
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'client/templates/index.html',
        }),
        new CopyPlugin({
            patterns: [
                { from: "client/manifest.json", to: "static" },
                { from: "client/assets", to: "static/assets" },
                { from: "client/css/font", to: "static/css/font" },
                { from: "client/css/*.css", to: "static/css/[name][ext]" },
                { from: "client/js/lib", to: "static/js/lib" },
            ],
        }),
    ],
    output: {
        filename: 'static/[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
};