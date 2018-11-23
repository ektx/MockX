const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    target: 'node',
    externals: {
        sqlite3: 'commonjs sqlite3'
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src/render/')
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader', 
                    'css-loader', 
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ]
}