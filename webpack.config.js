// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProduction = process.env.NODE_ENV === "production";
const htmlPath = path.join(__dirname, "/src/html/");

const config = {

    entry: {
        showcase: "./src/ts/index.ts",
        starter: "./src/ts/starter.ts",
    },
    output: {
        path: path.resolve(__dirname, "dist")
    },
    devServer: {
        open: false,
        host: "localhost",
        historyApiFallback: false,
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: "Volumetric Atmospheric Scattering",
            filename: "index.html",
            template: path.join(htmlPath, "indexSliders.html"),
            chunks: ["showcase"]
        }),
        new HtmlWebpackPlugin({
            title: "Starter",
            filename: "starter.html",
            template: path.join(htmlPath, "index.html"),
            chunks: ["starter"]
        }),
        new MiniCssExtractPlugin()
    ],


    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: "ts-loader",
                exclude: ["/node_modules/"]
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },

            {
                test: /\.s[ac]ss$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif|glb|obj)$/i,
                type: "asset"
            },

            {
                test: /\.html$/i,
                exclude: /node_modules/,
                loader: "html-loader"
            },

            {
                test: /\.(glsl|vs|fs|vert|frag|fx)$/,
                exclude: /node_modules/,
                use: ["raw-loader", "glslify-loader"]
            }


            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    }, 

    experiments: {
        topLevelAwait: true
    }
};

module.exports = () => {
    if (isProduction) {
        config.mode = "production";
    } else {
        config.mode = "development";
        config.devtool = "source-map";
    }
    return config;
};
