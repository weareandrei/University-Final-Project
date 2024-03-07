const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

const cssModule = {
    test: /\.css$/,
    use: [
        'style-loader',
        'css-loader',
        // 'postcss-loader', // Add postcss-loader here
    ],
};


const babelLoader = {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: {
        loader: "babel-loader",
        options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
        }

    }
}

const modules = {
    module: {
        rules: [ cssModule, babelLoader ]
    }
}

const plugins = {
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Omega',
            template: './index.html'
        })
    ]
}

module.exports = {
    mode: 'development',
    entry: {
        main:path.join(__dirname, './src/development.jsx')
    },
    output: {
        path: path.join(__dirname, './dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        historyApiFallback: true,
        static: {
            directory: path.join(__dirname, './dist'), // Adjust this to your output directory
        },
        port: 8080, // You can change the port to your desired value
    },
    ...modules,
    ...plugins
}
