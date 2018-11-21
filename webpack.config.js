const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src/render/')
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader',
                options: {
                    loaders
                }
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
    ],
    // externals: {
    //     sqlite3: 'commonjs sqlite3',
    //     express: 'commonjs express'
    // }
}