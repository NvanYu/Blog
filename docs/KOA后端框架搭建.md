# KOA后端开发基本框架搭建



> 引言：由于KOA框架太过精简，如果不做二次开发，将特别难用，根据一些资料和总结，把相关架构搭一下



### 1. 目录结构划分

```txt
- server.js               // 入口文件
- app                     // 放主要代码
  - api                   // 接口文件夹
    - v1                  // v1版本的api接口(按模块划分)
      - book.js
      - classic.js
    - v2            	    // v2版本的api接口
  - core            	    // 一些核心代码
    - db.js               // 数据库设置，例如设置sequelize或者mongoose
    - init.js             // 初始化的一些设置
    - http-exception.js   // 处理异常的类
    - lin-validator.js    // 校验器，依赖utils.js/http-exception.js
    - utils.js            // 配合校验器使用
  - model                 // 数据库模型创建，需要引入 /core/db.js 中的数据
    - user.js
  - validators            // 具体校验器
    - validator.js
  - middleware            // 错误处理中间件
    - exception.js
  - config
    - config.js
```


### 配置文件
```js
// config/config.js
module.exports = {
  // 配置环境
  environment: 'dev',
  // 数据库配置, 其他文件中可以通过global.database.dbName形式获取
  database: {
    dbName: 'xxx',
    host: 'xxx',
    post: 333,
    user: 'xxx',
    password: 'xxxx'
  }
}
```



### 2. 入口文件编写

```js
const Koa = require('koa');
const parser = require('koa-bodyparser');

// 导入错误处理中间件
const catchError = require('./middleware/exception');

// 主要是初始化路由的导入与注册
const InitManager = require('./app/core/init');
const app = new Koa();
app.use(catchError);
app.use(parser());
InitManager.initCore(app);
app.listen(3000);
```



### 3. core/init初始化文件编写

```js
const requireDirectory = require('require-directory');
const Router = require('koa-router');

class InitManager {
    static initCore(app) {
        InitManager.app = app;
        InitManager.initLoadRouters();
        InitManager.loadHttpException();
        InitManager.loadConfig();
    }
    
    // 加载配置文件
    static loadConfig() {
      const configPath = path || path.cwd() + '/config/config.js';
      const config = require(configPath);
      global.config = config;
    }
    
    static initLoadRouters() {
        const apiDirectory = `${process.cwd()}/app/api`;
        requireDirectory(module, apiDirectory, {
            visit: whenLoadModule
        })
        function whenLoadModule(obj) {
            if(obj instanceof Router) {
                InitManager.app.use(obj.routes());
            }
        }
    }
    // 初始化时加载异常类
    // 把异常类挂到global上是为了不在每个路由模块中导入各自的异常类（怕麻烦）
    // 可以直接在路由模块中写new global.errs.ParameterException()
    // 但是这样做可能会写错单词，所以还是导入好一点
    static loadHttpException() {
        const errors = require('./http-exception');
        global.errs = errors;
    }
}
module.exports = InitManager;
```



### 4. 路由模块编写示例

v1/book.js(其他的相同)

```js
const Router = require('koa-router');
const router = new Router();
router.get('/v1/book/getlatest', (ctx,next) => {
    ctx.body = {
        result: 'OK'
    }
})
router.post('/v1/book/getmore/:id', (ctx,next) => {
    const path = ctx.params;   // get params(like /:id)
    const query = ctx.request.query;  // get query param string
    const headers = ctx.headers;    // get request header
    const body = ctx.request.body;   // get request body(by koa-bodyparser middleware)
    ctx.body = {
        result: 'OK'
    }
})
module.exports = router;
```



### 5. 错误处理中间件编写(处理异常链)

app/middleware/exception.js

```js
const { HttpException } = require('../core/http-exception');
const catchError = async (ctx, next) => {
    try {
        // 考虑为了正常捕获异步的异常，加上await，只要有异步操作，都加await和async
        await next();
    } catch(error) {
        // 开发环境
        // 生产环境
        // 开发环境 不是HttpException
        const isHttpException = error instanceof HttpException
        const isDev = global.config.environment === 'dev'
        // 如果是开发环境并且不是HttpException异常，即未知异常
        if(isDev && !isHttpException){
            throw error
        }
        // 如果是开发环境，而且是HttpException异常（已知异常）
        // 或者不是开发环境，向客户端返回结果
        if(isHttpException){
            // 程序捕获的err不能直接返回客户端，要简化
            // 可以有http状态码，错误信息，详细的错误码，请求url
            // msg,error_code, http状态码由异常类管理
            // 请求方法和路径从ctx获取
            ctx.body = {
                msg:error.msg,
                error_code:error.errorCode,
                request:`${ctx.method} ${ctx.path}`
            }
            ctx.status = error.code
        }
        else{   // 未知异常
            ctx.body = {
                msg: 'we made a mistake O(∩_∩)O~~',
                error_code: 999,
                request:`${ctx.method} ${ctx.path}`
            }
            ctx.status = 500
        }
    }
}
module.exports = catchError;
```



### 6. 编写异常类

app/core/http-exception.js

```js
class HttpException extends Error {
    constructor(msg='服务器错误', errorCode=10000, code=400) {
        super();
        this.msg = msg;
        this.errorCode = errorCode;
        this.code = code;
    }
}

// 其他异常可以继承HttpException基类来定义自己的规范
class ParameterException extends HttpException {
    constructor(msg, errorCode) {
        super();
        this.code = 400;
        this.msg = msg || '参数错误';
        this.errorCode = errorCode || 10000;      
    }
}

// ......

module.exports = {
   HttpException,
   ParameterException,
   //......
}
```

具体使用

在路由模块中使用

```js
const Router = require('koa-router');
const router = new Router();
router.post('/v1/book/getmore/:id', (ctx,next) => {
    const path = ctx.params;  
    const query = ctx.request.query; 
    const headers = ctx.headers;    
    const body = ctx.request.body;
    if(....) {
        // global写法，当然也可以一个个导入
        const error = new global.errs.ParameterException();
        // 如果这里抛出异常，会向上抛，被全局异常处理中间件catchError中的await next()捕获
        // 然后catchError的catch会根据error对象的情况向客户端返回不同信息
        throw error;
    }
})
module.exports = router;
```



### 7. 校验器

1. 设置校验器，以路径中的id为例

```js
const { LinValidator, Rule } = require('../../core/lin-validator');

class PositiveIntegerValidator extends LinValidator {
    constructor() {
        super();
        this.id = [  // 检测哪个参数，那么这里名字要一样
            new Rule('isInt', '需要是正整数', {min: 1})
        ]
    }
}
module.exports = {
   PositiveIntegerValidator 
};
```

2. 使用校验器

```js
const Router = require('koa-router');
const router = new Router();
const { PositiveIntegerValidator } = require('../validators/validator.js');
router.post('/v1/book/getmore/:id', (ctx,next) => {
    const path = ctx.params;  
    const query = ctx.request.query; 
    const headers = ctx.headers;    
    const body = ctx.request.body;
    // 使用如下
    const v = new PositiveIntegerValidator().validate(ctx); // 传入ctx才会去找id参数
    const id = v.get('path.id');  //获取http参数id值，是数字类型，因为lin-validator会把原始值转为数字，如果要获取原始值，用v.get('path.id', parsed=false);
})
module.exports = router;
```





### 补充：在vscode中如何调试JS代码

调试当前文件

```json
1. 点击爬虫按钮，在lanuch.json中添加
{
      "type": "node",
      "request": "launch",
      "name": "当前文件",
      "program": "${file}",
}

2. 在nodemon启动时也启动调试,点击右下角添加配置,选择nodemon这项
{
      "type": "node",
      "request": "launch",
      "name": "nodemon",
      "runtimeExecutable": "nodemon",
      "program": "${workspaceFolder}/app.js",
      "restart": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": [
        "<node_internals>/**"
      ]
}
```

