import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import {CleanWebpackPlugin} from'clean-webpack-plugin'

const plugins = {
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'IndividualProject',
            template: './index.html'
        })
    ]
}

const cssModule = {
    test: /\.css$/,
    use: [
        'style-loader',
        'css-loader'
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

export default {
    mode: 'development',
    entry: './src/development.jsx',
    output: {
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        historyApiFallback: true,
        static: {
            // directory: path.join(__dirname, './dist'),
        },
        port: 8080,
    },
    ...modules,
    ...plugins
}
