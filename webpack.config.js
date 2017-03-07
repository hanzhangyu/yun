/**
 * Created by Paul on 2017/2/24.
 */
var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var SRC_PATH = path.resolve(__dirname, 'src');
var PUBLIC_PATH = path.resolve(__dirname, 'public');
var VIEW_PATH = path.resolve(__dirname, 'views');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var autoprefixer = require('autoprefixer');
var precss = require('precss');

var IS_DEV = process.env.NODE_ENV !== 'production';
console.log('env', process.env.NODE_ENV);

//// 删除目录下的文件函数
//var removeFiles = function (path) {
//    var folder_exists = fs.existsSync(path);
//    if (folder_exists == true) {
//        var dirList = fs.readdirSync(path);
//        dirList.forEach(function (fileName) {
//            fs.unlinkSync(path + fileName);
//        });
//    } else {
//        throw new Error('要删除的文件目录不存在');
//    }
//};
//// 生产线先删除编译后冗余的 js 和 css
//if (!IS_DEV) {
//    try {
//        removeFiles(PUBLIC_PATH + '/js/');
//        removeFiles(PUBLIC_PATH + '/css/');
//        fs.unlinkSync(VIEW_PATH + '/index.html');
//    } catch (e) {
//        console.log('---------------' + e + '---------------');
//    }
//}

var plugins = [
    new webpack.LoaderOptionsPlugin({
        //minimize: true,
        options: {
            postcss: function () {  // webpack 2 中不在支持在export中直接加了，坑死你的小保罗了
                return [precss, autoprefixer];
            }
        }
    }),
    //压缩打包的文件，包括JS以外的文件
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }),
    new HtmlWebpackPlugin({
        inject: true, // 注入资源,设置为 true, 则把所有 js 资源添加到 body 元素底部
        filename: '../views/index.html', // 设置输出的文件名
        template: path.join(SRC_PATH, 'index.html'), // 以 index.html 为模板,生成一个 html 文件到 output 配置的目录中
        chunks: ['index']  // 会自动添加 script 标签,引入这些文件
    }),
    new ExtractTextPlugin('css/[name].css'),
    new webpack.DefinePlugin({
        'process.env.NODE.ENV': 'development'
    })
];
// 测试环境需要在根目录下生成index.html，正式环境index.html移出去了
IS_DEV && plugins.push(
    new HtmlWebpackPlugin({//给dev-server使用
        inject: true,
        filename: 'index.html',
        template: path.join(SRC_PATH, 'index.html'),
        chunks: ['index']
    })
);

module.exports = {
    entry: {
        index: [path.join(SRC_PATH, 'index.js')]//使用[]包裹，这样入口文件可以被模块化加载
    },
    output: {
        path: PUBLIC_PATH,
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
                    fallbackLoader: 'style-loader',
                    loader: 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!' +
                    'postcss-loader!' +
                    'less-loader',
                    publicPath: '../'
                })
            },
            {
                test: /\.less$/,
                include: /src(\\|\/)layouts/,
                use: ExtractTextPlugin.extract({
                    fallbackLoader: 'style-loader',
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
            {test: /\.eot(\?\S*)?$/, loader: 'file-loader?name=font/[name].[ext]'},
            {test: /\.svg(\?\S*)?$/, loader: 'url-loader?limit=1024&mimetype=image/svg+xml&name=fonts/[name].[ext]'}
        ]
    },

    devServer: {
        hot: false,
        inline: true,
        // api proxy. 所有 /api/* 的请求都代理到 http://127.0.0.1:2618 了,而这个地址是通过 node 启动的一个服务器,用来返回 mock 数据
        // images proxy. 所有测试图片放在正式环境目录下，默认图片除外
        proxy: {
            '/api/*': {
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
