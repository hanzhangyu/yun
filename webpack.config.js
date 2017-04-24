/**
 * Created by Paul on 2017/2/24.
 */
var path = require('path');
var webpack = require('webpack');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var autoprefixer = require('autoprefixer');
var precss = require('precss');

var config = require('./config');

var IS_DEV = process.env.NODE_ENV !== 'production';
console.log('env', process.env.NODE_ENV);
var plugins = [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.LoaderOptionsPlugin({
        devtool: "cheap-module-eval-source-map",
        //minimize: true,
        options: {
            postcss: function () {  // webpack 2 中不在支持在export中直接加了，坑死你的小保罗了
                return [precss, autoprefixer];
            }
        }
    }),
    new HtmlWebpackPlugin({
        inject: true, // 注入资源,设置为 true, 则把所有 js 资源添加到 body 元素底部
        filename: '../views/index.html', // 设置输出的文件名
        template: path.join(config.SRC_PATH, 'index.html'), // 以 index.html 为模板,生成一个 html 文件到 output 配置的目录中
        chunks: ['index']  // 会自动添加 script 标签,引入这些文件
    }),
    new ExtractTextPlugin('css/[name].css'),// 分离CSS和JS文件
    new webpack.DefinePlugin({
        "process.env": {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV || "development")
        }
    })
];

//If you use UglifyJsPlugin you should always set NODE_ENV to production. If you're not building for production, remove UglifyJsPlugin to not get any warnings.
// 测试环境需要在根目录下生成index.html，正式环境index.html移出去了
IS_DEV ? plugins.push(
    new HtmlWebpackPlugin({//给dev-server使用
        inject: true,
        filename: 'index.html',
        template: path.join(config.SRC_PATH, 'index.html'),
        chunks: ['index']
    })
) : plugins.push(
    //压缩打包的文件，包括JS以外的文件
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    })
);

module.exports = {
    entry: {
        index: [path.join(config.SRC_PATH, 'index.js')]//使用[]包裹，这样入口文件可以被模块化加载
    },
    output: {
        path: config.PUBLIC_PATH,
        publicPath: '',
        filename: 'js/[name].js'
    },
    plugins: plugins,
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'react-hot-loader'
                    },
                    {
                        loader: 'babel-loader'
                    }
                ]
            },
            {
                test: /\.less$/,
                include: /src(\\|\/)(containers|components)/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    loader: 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!' +
                    'postcss-loader!' +
                    'less-loader',
                    publicPath: '../'
                })
            },
            {
                test: /\.(less|css)$/,
                include: /src(\\|\/)layouts/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    loader: 'css-loader!' +
                    'postcss-loader!' +
                    'less-loader',
                    publicPath: '../'
                })
            },

            // css
            {
                test: /\.css$/,
                include: path.resolve(__dirname, './node_modules'),
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }
                ]
            },
            {
                test: /\.(png|gif|jpg|ico)$/, loader: 'url-loader?limit=1024&name=images/[name].[ext]'
            },

            // font
            {

                test: /\.woff(\?\S*)?$/,
                loader: 'url-loader?limit=1024&mimetype=application/font-woff&name=fonts/[name].[ext]'
            },
            {
                test: /\.woff2(\?\S*)?$/,
                loader: 'url-loader?limit=1024&mimetype=application/font-woff&name=fonts/[name].[ext]'
            },
            {
                test: /\.ttf(\?\S*)?$/,
                loader: 'url-loader?limit=1024&mimetype=application/octet-stream&name=fonts/[name].[ext]'
            },
            {test: /\.eot(\?\S*)?$/, loader: 'file-loader?name=fonts/[name].[ext]'},
            {test: /\.svg(\?\S*)?$/, loader: 'url-loader?limit=1024&mimetype=image/svg+xml&name=fonts/[name].[ext]'}
        ]
    },

    devServer: {
        host: '0.0.0.0',//hostname or IP. 0.0.0.0 binds to all hosts.
        port: 3000,
        hot: true,
        inline: true,//实时刷新
        historyApiFallback: true,//不跳转
        contentBase: ".",//本地服务器所加载的页面所在的目录
        stats: {
            colors: true
        },
        // api{site,search,root,note} proxy. 所有 /api/* 的请求都代理到 http://127.0.0.1:3001 了,而这个地址是通过 node 启动的一个服务器,用来返回 mock 数据
        // images proxy. 所有测试图片放在正式环境目录下，默认图片除外
        proxy: {
            '/site/*': {
                target: 'http://127.0.0.1:3001',
                secure: false
            },
            '/note/*': {
                target: 'http://127.0.0.1:3001',
                secure: false
            },
            '/search/*': {
                target: 'http://127.0.0.1:3001',
                secure: false
            },
            '/root/*': {
                target: 'http://127.0.0.1:3001',
                secure: false
            },
            '/images/*': {
                target: 'http://127.0.0.1:3001',
                secure: false
            }
        }
    }
};
