# Webpack从基础到实战

>  webpack是一个现代Javascript应用程序的静态模块打包器(module bundler)。当webpack处理应用程序时，会递归构建一个依赖关系图(dependency graph)，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个bunble

> webpack本身是基于node.js开发的

> 从webpack4.0开始，可以不用引入配置文件（零配置），然而webpack仍然是可以高度配置的

> 模块转换器（loader）：用于把模块原内容按照需求转换成新内容，可以加载非JS模块

> 扩展插件（plugin）: 在webpack构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想做的任何事情


# 前端项目为什么要打包和构建
+ 体积更小（tree-shaking、压缩、合并），加载更快
+ 编译高级语法（ts，es6+，less等）
+ 兼容性处理。错误检查（polyfill，postcss，eslint）
+ 统一，高效的开发环境
+ 统一的构建流程和产出标准
+ 集成公司构建规范（提测，上线）


## 1. 安装webpack

目前@vue/cli和create-react-app基本上采用webpack4.0以上版本；第四代以上版本需要安装webpack和webpack-cli（可执行命令）

为了防止全局安装webpack的版本冲突，真实项目开发基本是安装在本地项目为主:

```bash
$ yarn init -y
$ yarn add webpack webpack-cli -D
```



## 2. webpack配置使用

+ 零配置

  ```bash
  /*
    默认会打包src目录中的js文件（入口默认index.js）
    打包完成目录默认dist/main.js
    默认执行node_modules/bin/webpack.cmd
    webpack默认支持CommonJS和ES6 Module的模块规范，以此进行打包
  **/
  /* npm 5.2以后才支持的命令 */
  $ npx webpack
  ```
  
+ scripts脚本设置示例
  ```json
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack --mode development",
    "dev:server": "webpack-dev-server"  会找node_module目录下bin目录中的webpack-dev-server命令
  }
  ```

+ 自定义配置(关于webpack配置讲解都放在配置的源码中)

  ```javascript
  // webpack.config.js 或者 webpackfile.js
  // webpack本身是基于node.js开发的,所以要用CommonJS规范写
  let path = require('path');
  // 导入的插件都是类，要new
  // 抽离CSS文件的插件
  let MiniCssExtractPlugin = require('mini-css-extract-plugin');
  // 压缩CSS文件的插件
  let OptimizeCssAssetsWebpackPlugin = require('optimiz-css-assets-webpack-plugin');
  // 压缩JS的插件
  let UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
  // 处理html文件的插件
  let HtmlWebpackPlugin = require('html-webpack-plugin');
  module.exports = {
      // 配置环境：开发环境developement,生产环境production
      mode: 'development',
      // 入口
      entry: ['@babel/polyfill', './src/index.js'],
      // entry: {index: './src/index.js'} 对象形式写法
      // 出口
      output: {
          // 输出文件名
          // 文件指纹:hash: 跟整个项目的构建相关，只要项目中有文件更改，整个项目构建的hash都会变，并且全部文件都使用相同的hash值
          // chunkHash: 根据不同入口文件进行构建对应的chunk，生成对应的hash值，生产环境把公共库和程序入口文件区分开，单独打包构建，接着用        chunkHash生成hash，那么只要公共库的代码不改，就可以保证hash不受影响
          // contentHash： 只要文件内容不变，就不会重复构建hash
          // 此类hash作用，配合CDN缓存使用:webpack本地构建->生成的文件名带上md5值->文件内容变->文件hash变->html引用的URL地址变->触发CDN服务器从服务器从源服务器拉取新的对应数据->更新本地缓存
          filename: 'bundle.[contentHash:8].js',
          // 输出目录必须是绝对路径
          path: path.resolve(__dirname, 'dist'),
          publicPath: './'   // 给编译引用资源地址前设置前缀
      },
      // 关于webpack-dev-server的一些配置
      // 执行命令: webpack-dev-server --config xxx.js
      // 特点: 服务器启动后不会关闭，修改src目录下的文件后会自动编译然后自动刷新浏览器
      devServer: {                // 在内存中打包，所有内容在根目录下
          port: 3000,             // 创建服务指定的端口
          open: true,             // 编译完成是否自动打开浏览器
          progress: true,         // 显示打包的进度条
          contentBase: './dist',  // 指定当前服务处理资源的目录
          compress: true,
          proxy: {
            "/api": {
              target: "http://localhost:6000",  // 设置请求服务器的地址
              secure: false,   // 代理的服务器是https
              changeOrigin: true,  // 设置请求头host(自己端口号地址9999)地址改成服务器地址(9999会变成服务器地址6000)
              pathRewrite: {"/api": ""}  //重写路径，如客户端请求有/api/user,但服务器匹配的只有/user，所以要把/api去掉(换成空即可)
          }
    }
      },
      // webpack中使用插件，放在plugins的数组配置中
      plugins: [
          new HtmlWebpackPlugin({
              // 指定自己的模板
              template: './src/index.html',
              // 输出的文件名
              filename: 'index.html',
              // 给引入html中的文件设置以问号开头的HASH戳（清除缓存），也可以在output中设置filename:bundle.min.[hash].js来生成不同的文件
              hash: true,
              // 控制是否以及何种方式最小化输出(即压缩html文件)
              minify: {
                  collapseWhitespace: true,
                  removeComments: true,
                  removeAttributeQuotes: true,
                  removeEmptyAttribute: true
              }
          }),
          new MiniCssExtractPlugin({
              // 设置分离出的css存放的目录以及文件名
              /*
                然后要再次配置loader
                  {
                    test: /\.css$/,
                    use: [
                      {
                        loader: MiniCssExtractPlugin.loader // 分离后的css以外链方式引入html文件，此时style-loader就不要了
                      }
                    ]
                  }
              */
              filename: 'css/main.css' // 分目录打包css文件
          })，
          // 可以配置清除打包目录下的文件
          new CleanWebpackPlugin({
              // 可以配置清除打包目录下的文件，哪些要清楚，哪些不用
              cleanOnceBeforeBuildPatterns: ['cc/*', "!cc/a.js"]
          })
      ],
      // 配置模块加载器loader,webpack只认识js和json文件，loader让webpack能处理其它类型的文件
      // loader位于module配置中，有test和use这2个属性
      module: {
          // 模块规则：使用加载器（默认从右向左执行，从下向上）
          rules: [{
              // css处理相关loader : less less-loader | node-sass sass-loader | stylus stylus-loader
              // {test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader']}
              test: /\.(css|less)$/,  // 基于正则匹配哪些模块需要处理
              use: [
                  // 把CSS插入到head以内嵌style标签的方式，但要把CSS文件导入index.js入口文件才有效
                  'style-loader',   // 也可以选下面的方式(选一个就行)
                  MiniCssExtractPlugin.loader, // 把抽离的CSS以link方式引入html文件
                  // 编译解析@import/url()这种语法
                  'css-loader',
                  /*
                    改进版css-loader配置
                    use: [{
                      loader: 'css-loader',
                      options: {
                        importLoaders: 2 // 用后面2个加载器来解析,用处:在css文件中引入了less文件
                      }
                    }, 'postcss-loader', "less-loader"]
                  */
                  // 设置前缀，要配合autoprefixer使用  postcss-loader(样式处理工具)一般配合autoprefixer使用
                  /*
                      也可以在根目录新建postcss.config.js中配置
                      module.exports = {
                        plugins: [
                          require('autoprefixer')
                        ]
                      }
                  */
                  {
                      loader: 'postcss-loader',
                      options: {
                          ident: 'postcss',
                          plugins: [
                              require('autoprefixer')
                          ]
                      }
                  },
                  {
                      // loader可以是对象形式，这个就可以配置更多选项
                      // 需要安装less less-loader
                      loader: 'less-loader',
                      options: {
                          // 加载器额外配置选项，根据需求配置即可
                      }
                  }
                  
              ]
          }, {
              // 解析es6，es7 @babel/core: 核心模块, babel-loader: 解析js，是webpack和babel的桥梁, @babel/preset-env: es6->es5插件的集合
              test: /\.js$/i,
              // 编译JS的loader
              use: ['babel-loader', 'eslint-loader'],
              exclude: /node_modules/,
              include: path.resolve(__dirname, 'src'),
              enforce: "pre"  // 在所有规则之前先校验代码    去官网下一个.eslintrc.js文件.eslint爱配不配，看需求
              // 然后在根目录创建.babelrc文件
              /*
                {
                  "presets": [
                    [
                      "@babel/preset-env",
                      {
                        "useBuiltIns": "usage",  只转换使用的api
                        "corejs": 3  取代@babel/polyfill转换高版本api，需要安装core-js@3
                      }
                    ]
                  ],
                  使用插件处理>=ES6中的特殊语法
                  "plugins": [
                    '@babel/plugin-transform-runtime', 依赖@babel/runtime，会自动找这个插件，所以不用配
                    ['@babel/plugin-proposal-decorators', {'legacy': true}],
                    ['@babel/plugin-proposal-class-properties', {'loose': true}]        
                  ]
                }
              */
          }, {
              // 处理html文件导入img图片的loader
              // 在JS（如JSX）中使用图片(webpack)，要基于模块方式把图片当做资源导入才能使用(相对路径要这样处理，绝对路径不用，例如网络图片链接就不用这种方式处理)
              test: /\.(html|htm|xml)$/i,
              use: ['html-withimg-loader']
          }, {
              test: /\.(png|jpg|gif|jpeg|ico|webp|bmp)$/i,
              use: [{
                  loader: 'url-loader',  // 把指定大小的图片变成base64格式,也可以用file-loader
                  options: {
                      // 图片小于200kb，直接base64编码，若大于200kb会自动调用file-loader打包成文件输出
                      limit: 200 * 1024, 
                      // 分目录打包，控制打包后图片所在目录目录
                      outputPath: '/images'   
                  }
              }]
          }, {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[ext]'  [name]配置打包后的图片名不要变
            }
          }]
      },
      // 配置优化规则
      optimization: {
          // 压缩优化,是一个数组，因为可能有多个文件压缩优化配置
          minimizer: [
              // 压缩CSS(产生问题：配置压缩优化之后，JS压缩不在执行自己默认的压缩方式了，也走的是这个插件，从而导致无法压缩)
              new OptimizeCssAssetsWebpackPlugin(),
              // 解决上面说的配置压缩CSS后的问题
              new UglifyjsWebpackPlugin({
                  cache: true,    // 是否使用缓存
                  paraller: true,   // 是否开启并发压缩
                  sourceMap: true   // 启动源码映射(方便调试)
              })
              // terser-webpack-plugin也可以压缩JS
          ]
      }
  }
  ```



## 3. 补充

1. *webpack-dev-server 配置开发服务  这个插件打包后的内容是在内存中的*，不会生成打包后的文件

2. *file-loader  把图片解析成文件（根据图片生成一个md5发射到dist目录，返回当前文件目录）  字体图标只能用file-loader解析*(eot|svg|ttf|woff|woff2)

3. *url-loader   把小图片解析成base64*

4. *html-withimg-loader  处理html文件中的图片*

5. babel-loader babel和webpack的桥梁，使webpack可以通过babel去编译代码

6. @babel/core  babel核心模块

7. @babel/preset-env  主要是es6 -> es5  插件的集合

8. babel的配置一般会放置到单独配置文件 .babelrc 当加载@babel/core模块时会自动去找.babelrc看有没有预设和插件

9. @babel/plugin-proposal-class-properties 处理类草案的语法

10. @babel/plugin-proposal-decorators  处理装饰器语法*

11. @babel/plugin-syntax-dynamic-import

12. @babel/preset-react

13. *clean-webpack-plugin*插件使用

14. *webpack-merge插件*合并webpack配置

15. new webpack.HotModuleReplacementPlugin()插件

16. sourceMap(代码排查)

    devtool字段配置

    开发环境推荐

    cheap-module-eval-source-map

    生产环境推荐

    cheap-module-source-map

17. image-webpack-loader图片压缩

18. Tree-shaking(生产环境)(要在package.json文件中做配置) -> "sideEffects": false，只有es6module支持，因为是静态引入，编译时引入，能做静态分析实现tree-shaking，commonjs是动态引入，执行时引入，不能做tree-shaking

19. Scope-Hoisting:webpack4 后不用配，天生自带，用来减少作用域提升性能

20. css文件热更新是通过style-loader实现的，如果把css文件抽离出来后以link形式引入就不起作用了，所以loader要用stylu-loader，不要用MiniCssExtractPlugin.loader，同时注意，有时css热更新会有bug，因此要配置一个webpack插件

    new webpack.HotModuleReplacementPlugin()(webpack自带插件)(防止热更新后刷新整个网页)

    module.hot.accept

21. 安装webpack-bundle-analyzer插件,配合splitChunks一起用

    const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

    new BundleAnalyzerPlugin()  生产环境下

22. 懒加载：webpackChunkName   chunkFileName(在output字段设置)

    webpackPrefetch

```js
optimization: {
    // new TerserPlugin({}) 也是压缩JS的
    minimizer: [new TerserPlugin({}), new OptimizeCssAssetsPlugin({})],
    splitChunks: {
      chunks: 'async',  // 抽离异步代码  all是抽离所有, initial抽离同步代码
      minSize: 30000,   // 至少30kb才去抽离
      maxSize: 0,       // 
      minChunks: 1,     // 至少引用模块一次
      maxAsyncRequests: 5,    // 请求最多不超过5次
      maxInitialRequests: 3,  // 首屏请求次数不超过3次
      automaticNameDelimiter: '~',  // 抽离模块名称的连接符
      automaticNameMaxLength: 30,   
      name: true,   // 可以更改模块名
      cacheGroups: {   // 自己设定一些规则，若符合缓存组的配置设置，会打包到各自缓存组中
        vendors: {
          test: /[\\/]node_modules[\\/]/,  // 当抽离同步代码时，根据缓存组的配置，若发现模块来自node_module，会走vendors配置，生成的文件类似vendors~main,main是打包的入口文件
          priority: -10  // 优先级越高，会优先使用当前缓存组
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
},
devtool: "cheap-module-eval-source-map",
devServer: {
    port: 9999,
    open: true,
    compress: true,
    hot: true,
    contentBase: "static",   // 表示static目录下的静态资源文件是可以访问的
    // before(app) {  // 对应有一个after，意为以本地端口9999创建一个服务，这样就没有跨域问题了
    //   app.get('/api/user', function(req, res) {
    //     res.json({name: 'yy'});
    //   })
    // },
    
  },
```


## 关于webpack优化思路
+ 小图base64
+ bundle加hash
+ 懒加载
+ 代码分割
+ 优化babel-loader，exclude
+ IngorePlugin，例如忽略moment下的语言包，要用什么自己引入
+ noParse，对于一些已经打包构建好的库或文件不要再次打包
+ happypack 多进程打包，多进程打包是否需要看项目大小，小项目其实可以不用多进程打包，因为会耗费进程资源
+ ParallelUglifyPlugin
+ webpack-dev-server 开发时自动刷新
+ DllPlugin，webpack内置，统一版本只构建一次
+ production 模式下回自动压缩，vue和react会自动删除调试代码，自动启动tree-shaking
+ CDN加速，配置output配置下的publicPath选项，css和js等静态文件上传CDN即可



**### 多入口多出口**

```javascript
module.exports = {
    entry: {
      index: './src/index.js',
      other: './src/other.js'
    },
    output: {
      filename: '[name].js',  // [name]中的name指的是入口文件配置的index和other
      path: path.resolve(__dirname, './dist');
      // 此时，打包的文件会在一个html文件中，如果想要index.js打包到index.html，other.js打包到other.html，要在html-webpack-plugin中修改一个配置，加一个chunks: ['index']
    },
    plugins: [
      *// new HtmlWebpackPlugin({*
      *//   template: './index.html',*
      *//   filename: 'index.html',*
      *//   chunks: ['index', 'other']  // 将打包后的2个js文件放入index.html*
      *// })*
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        chunks: ['index'] *// 这样的话，生成的index.html文件中就只有index.js*
      }),
      new HtmlWebpackPlugin({
        template: './other.html',
        filename: 'other.html',
        chunks: ['other']  *// 生成的other.html文件中就只有other.js*
      })
      *// 注意，如果我们还有多个入口要以这样的方式打包，如果copy这样的话就太烦了*
      *// 下面的代码解决这个问题*
    ]
}

let htmlPlugins = ['index', 'other'].map(chunkName => {
  return new HtmlWebpackPlugin({
    template: `./${chunkName}.html`,
    filename: `${chunkName}.html`,
    chunks: [`${chunkName}`]
  })
})

module.exports = {
  plugins: [
    ...htmlPlugins
  ]
}
```



## .babelrc文件

```json
{
  "presets": [  // 从下往上加载
    ["@babel/preset-env", {
      "useBuiltIns": "usage",   // 按需加载
      "corejs": 3   // 解析高版本语法(需要安装npm i core-js@3) 相当于@babel/polyfill插件,babel7.4以后不用polyfill了，推荐使用corejs和regerenator，polyfill是他俩的集合，polyfill会污染全局环境，自己写三方库用babel-runtime
    }]
  ],
  "plugins": [   // 从上往下加载
    // 通过@babel/plugin-transform-runtime 调用  @babel/runtime，减少冗余代码量，直接用@babel/plugin-transform-runtime即可
    "@babel/plugin-transform-runtime",
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ]
}
```



## .browserslistrc文件

```txt
cover 99.5%
```



## 关于多页面打包

1. 规范目录结构
2. 制定合理的entry匹配规则
3. 实现entry动态计算
4. 根据entry的key值增加对应的html-webpack-plugin

目录结构示例如下:

```txt
/src
  /page
     /detail
        index.html
        index.js
     /index
        index.html
        index.js
     /list
        index.html
        index.js
```



配置如下:

```js
const setMPA = () => {
    const entry = {};
    const htmlWebpackPlugins = [];
    // glob npm包
    const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));
    entryFiles.map(entryFile => {
        const match = entryFile.match(/src\/(.*)\/index\.js/);
        const pageName = match && match[1];
        entry[pageName] = entryFile;  
        htmlWebpackPlugins.push(
          new HtmlWebpackPlugin({
              inlineSource: '.css$',
              template: path.join(__dirname, `src/${pageName}/index.html`),
              filename: `${pageName.html}`,
              chunks: [pageName],
              inject: true,
              minify: {
                  html5: true,
                  collapseWhitespace: true,
                  preserveLineBreaks: false,
                  minifyCSS: true,
                  minifyJS: true,
                  removeComments: false
              }
          })
        )
    })
    return {
        entry,
        htmlWebpackPlugins
    }
}
```

## 暴露全局变量
1. 直接使用CDN方式  add-asset-html-cdn-webpack-plugin
```js
new AddAssetHtmlPlugin(true, {  // 不能放html-webpack-plugin前面
  "jquery": "cdn地址"
})
// 配合externals使用
module.exports = {
  externals: {
    'jquery': '$'  // $外部变量， 不用打包
  }
}
```

2. providePlugin 自动加载模块，不用import和require,给每个模块注入变量
```js
const webpack = require('webpack');
new webpack.ProvidePlugin({
  "$": 'jquery',  // $是来自jquery，每个模块都注入变量$，而不是注入全局
  _map": ['lodash', 'map']  // 直接把lodash的方法暴露在全局
})
```

3. expose-loader
```js
{
  test: require.resolve('jquery'),
  use: {
    loader: 'expose-loader',
    options: '$'   // 注意在每个模块使用时要引入 import $ from 'jquery'
  }
}
```

## 懒加载（动态加载模块）
示例:点击按钮加载模块
```js
btn.addE  ventListener('click', function() {
  import('./test').then({default: m}) => {
    op.innerHTML = m(20,10);
  }
})

// 注意，在webpack的配置文件中，output字段加一行
output: {
  chunkFilename: '[name].min.js'  // [name]是从0开始的数字来命名动态文件
}

// 当然，可以给动态文件重新起名
btn.addE  ventListener('click', function() {
  import(/* webpackChunkName: 'ywy' */'./test').then({default: m}) => {
    op.innerHTML = m(20,10);
  }
})

// 扩展知识
// webpackPretetch: webpack预引入: 利用浏览器空闲时间把动态模块提前引入，条件：主模块全部加载完成后，才会把动态文件加载完成再引入
// webpackPreload: webpack预加载: 跟主模块代码同时进行加载，但不会引入
import(/* webpackPretetch:true */'./test')
import(/* webpackPreload:true */'./test')
```

## resolve解析
```js
module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.json', 'ts', 'tsx'],  // 添加扩展名进行匹配
    alias: {  // 设置别名
      'test': path.resolve(__dirname, 'src/test'),
      '@': path.resolve(__dirname, 'src')
    }
  }
}
```

## happypack(多线程打包)

## 根据mode分离配置环境
webpack.base.js  公共配置

webpack.dev.js   开发环境配置

webpack.prod.js  生产环境配置

修改scripts命令
```json
{
  "scripts": {
    "dev": "webpack --env.development --config ./webpack.base",
    "build": "webpack --env.production --config ./webpack.base"
  }
}
```

配置大致如下:
```js
// webpack.base.js
const dev = require('./webpack.dev');
const prod = require('./webpack.prod');
const merge = require('webpack-merge');
module.exports = (env) => {
  let base = {....};  // 按照之前module.exports配置时的那个对象
  if(env.development) {
    return merge(base, dev);
  } else {
    return merge(base, prod);
  }
}

// webpack.dev.js设置mode为development，其他配置按照开发环境配置即可
// webpack.prod.js设置mode为production，其他配置按照生产环境配置即可
```

## webpack手写loader
[手写webpack之loader原理入口](https://github.com/NvanYu/Blog/issues/48)
