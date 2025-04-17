const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/script/index.js",  
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"  
    },
    mode: "development",
    devServer: {
        static: {
            directory: path.join(__dirname, "dist"),
        },
        port: 8080,
        historyApiFallback: true
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html"
        }),
        new CopyWebpackPlugin({
            patterns: [
               
                
                { from: "./src/script/service-worker.js", to: "service-worker.js" },
                { from: "./manifest.json", to: "manifest.json" },
                { from: "./src/styles.css", to: "styles.css" },
                { from: "./src/script/db.js", to: "db.js" },
                { from: "./src/icons", to: "icons" }, 
                { from: "./src/404.html", to: "404.html" },
                { from: "./src/favicon1.ico", to: "favicon1.ico" },
{ from: "./src/script/AddStory.js", to: "AddStory.js" },
{ from: "./src/script/Home.js", to: "Home.js" },
{ from: "./src/script/Profile.js", to: "Profile.js" },
{ from: "./src/script/StoryModel.js", to: "StoryModel.js" },
{ from: "./src/script/StoryPresenter.js", to: "StoryPresenter.js" },
{ from: "./src/script/UI.js", to: "UI.js" }


            ]
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            }
        ]
    }
};
