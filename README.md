## pre-research-demo

## 项目说明

又一个由hi创建的 `vanilla` 项目......

## 用法

调试、编译等所有命令都直接使用gulp

### 命令
```
// 调试所有页面，dev时默认env为local
gulp
gulp dev

// 调试指定页面
gulp -t myPage
gulp dev -t myPage

// 针对日常环境打包所有页面，build时默认env为release
gulp build

// 针对线上环境打包指定页面
gulp build -t myPage

// 打包且带上debug工具
gulp build -t myPage -d

// jshint查错
gulp lint

// 单元测试，代码覆盖率 mocha+chai+istanbul
gulp test

// TTD模式
gulp ttd
```

### 附加参数
```
-t --target [pageName]      指定目标页面
-a --all                    和--target一起使用，编译所有页面，但只打开指定页面
-r --root [rootPath]        指定gulp根目录，默认项目根目录
-h --host [hostName]        指定dev server的主机名，默认localhost
-p --port [portNumber]      指定dev server监听的端口，默认8001
-l --local                  本地开发模式，库文件来自本地而不是cdn
```

### 单元测试
测试文件必须以.spec.js结尾
测试框架为mocha + chai
