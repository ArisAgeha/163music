const path = require('path');
var htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: ['./src/js/app.js'],
	output: {
		filename: 'js/bundle.js',
		path: path.resolve(__dirname, 'dist/')
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
    devtool: 'eval-source-map',
	watchOptions: {
		aggregateTimeout: 300,
		poll: 1000
	},
	plugins:[
        new htmlWebpackPlugin({
            //注意传的参数是一个对象
            template:'./src/index.html'   //传一个模板，就是根目录下的index.html
        })
    ]
};
