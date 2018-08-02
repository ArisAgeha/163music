const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    entry: {
        app: './src/js/app.js',
        admin: './src/js/admin.js',
        picwall: './src/js/picwall.js'
    },
    output: {
        filename: 'dist/js/[name].js',
        path: path.resolve(__dirname, './')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS
                ]
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                ]
            },
            {
                test: /\.(png|jsp|gif|jpg)/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 500000
                    }
                }]
            },
            {
                test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=fonts/[name].[ext]'
            },
            {
                　　test: /\.html$/,
                　　loader: 'html-withimg-loader'
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src']
                    }
                }
            }
        ]
    },
    // devtool: 'eval-source-map',
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
    },
    plugins:[
        new HtmlWebpackPlugin({
            //注意传的参数是一个对象
            template:'./src/index.html',   //传一个模板，就是根目录下的index.html
            chunks: ['app'],//需要引入的chunk，不配置就会引入所有页面的资源
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            }
        }),
        new HtmlWebpackPlugin({ //根据模板插入css/js等生成最终HTML
            filename: './admin.html', //生成的html存放路径，相对于path
            template: './src/admin.html', //html模板路径
            hash: true, //为静态资源生成hash值
            chunks: ['admin'],//需要引入的chunk，不配置就会引入所有页面的资源
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            }
        }),
        new HtmlWebpackPlugin({ //根据模板插入css/js等生成最终HTML
            filename: './picwall.html', //生成的html存放路径，相对于path
            template: './src/picwall.html', //html模板路径
            hash: true, //为静态资源生成hash值
            chunks: ['picwall'],//需要引入的chunk，不配置就会引入所有页面的资源
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            }
        }),
        new CompressionPlugin({
            asset: '[path].gz[query]', //目标资源名称。[file] 会被替换成原资源。[path] 会被替换成原资源路径，[query] 替换成原查询字符串
            algorithm: 'gzip',//算法
            test: new RegExp(
                '\\.(js|css)$'  //压缩 js 与 css
            ),
            threshold: 10240,//只处理比这个值大的资源。按字节计算
            minRatio: 0.8,//只有压缩率比这个值小的资源才会被处理
            deleteOriginalAssets: true
        })
    ]
};
