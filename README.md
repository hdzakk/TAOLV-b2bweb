# 淘绿web

## 使用说明
- 本项目使用包管理工具NPM，因此需要先把本项目所依赖的包下载下来：
```
$ npm install
```

- 启动服务器
```
$ npm run start
```

- 理论上来说，webpack-dev-server会自动帮你打开浏览器并展示示例页面；如果没有的话，请手动打开浏览器，在地址栏里输入`ip:端口`。

## CLI命令(npm scripts)
| 命令            | 作用&效果          |
| --------------- | ------------- |
| npm run dist   | 根据`webpack.config.js`，打包出一份生产环境的代码 |
| npm run dev     | 根据`webpack.dev.config.js`，打包出一份开发环境的代码 |
| npm run start   | 开启webpack-dev-server并自动打开浏览器，自动监测源码变动并实现LiveReload，**推荐实际开发时使用此项** |

## 目录结构说明
```
├─build # 编译后生成的所有代码、资源（图片、字体等，虽然只是简单的从源目录迁移过来）
├─node_modules # 利用npm管理的所有包及其依赖
├─vendor # 所有不能用npm管理的第三方库
├─.babelrc # babel的配置文件
├─.eslintrc # ESLint的配置文件
├─index.html # 仅作为重定向使用
├─package.json # npm的配置文件
├─webpack-config # 存放分拆后的webpack配置文件
│   ├─base # 主要是存放一些变量
│   ├─inherit # 存放生产环境和开发环境相同的部分，以供继承
│   └─vendor # 存放webpack兼容第三方库所需的配置文件
├─webpack.config.js # 生产环境的webpack配置文件（无实质内容，仅为组织整理）
├─webpack.dev.config.js # 开发环境的webpack配置文件（无实质内容，仅为组织整理）
├─src # 当前项目的源码
    ├─pages # 各个页面独有的部分
    │  ├─index(首页) # 业务模块
    │  │  └─index 
    │  │     ├─content.ejs # ejs模板放置html部分
    │  │  	 ├─html.js # els模板针对的js文件
    │  │     └─page.js # 页面的业务逻辑js
    │  │
    │  └─ ...(后面很多类似)
    │
    └─public # 各个页面使用到的公共资源
        ├─components # ejs组件，比如头部、底部需要需要include的小模块
        │  ├─footer # 页尾
        │  ├─header # 页头
        │  ├─top # 各页面头部菜单
        │  ├─nav # 各页面头部顶部导航条
        │  ├─aboutNav # 关于我们头部菜单
        │  ├─userNav # 会员中心头部菜单
        │  ├─zixunNav # 资讯头部菜单
        │  └─userTemplate # 会员中心各个页面的模板
        │  
        ├─config # 各种配置文件
        ├─iconfont # iconfont的字体文件
        ├─images # 公用的图片资源
        ├─layout # UI布局，组织各个组件拼起来，因应需要可以有不同的布局套路
        │  ├─layout # 具体的布局套路
        │  └─layout-without-nav # 具体的布局套路
        ├─less # less文件
        ├─script # 各页面的业务逻辑js文件
        ├─libs # 与业务逻辑无关的库都可以放到这里
        └─logic # 
```
