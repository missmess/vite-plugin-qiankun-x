# vite-plugin-qiankun-x

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-qiankun-x"><img src="https://img.shields.io/npm/v/vite-plugin-qiankun-x" alt="Version" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-qiankun-x"><img src="https://img.shields.io/github/languages/top/missmess/vite-plugin-qiankun-x" alt="Languages" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-qiankun-x"><img src="https://img.shields.io/npm/l/vite-plugin-qiankun-x" alt="License" /></a>
  <a href="https://github.com/AttoJS/vite-plugin-qiankun-x/stargazers"><img src="https://img.shields.io/github/stars/missmess/vite-plugin-qiankun-x" alt="Star" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-qiankun-x"><img src="https://img.shields.io/npm/dm/vite-plugin-qiankun-x" alt="Download" /></a>
</p>

<p align="center">
  <a href="https://github.com/missmess/vite-plugin-qiankun-x/blob/main/README.md">English</a> | <b>简体中文</b>
</p>

---

一个Vite插件用于[qiankun](https://qiankun.umijs.org/zh)微应用。支持Vue和React。

## 特性

- 零配置，添加插件即可使用。

- 保留Vite下全部ESM特性。

- 支持React的热更新（其它使用到内联ESM的库均已支持）。

- 无副作用。可独立运行也可在qiankun中运行。

- 可以搭配[vite-plugin-dynamic-base](https://github.com/chenxch/vite-plugin-dynamic-base)实现多环境部署。

## 安装

```bash
npm i vite-plugin-qiankun-x -D
```

## 用法

#### 基础用法

在`vite.config.js`中添加插件。

```javascript
import { defineConfig } from 'vite'
import qiankun from 'vite-plugin-qiankun-x'

export default defineConfig({
    plugins: [qiankun('your-micro-app-name')],
})
```

当然，你必须在入口脚本中（通常是main.ts）**导出**生命周期钩子。因为qiankun需要它。

```javascript
export function bootstrap() { /* ... */ }
export function mount(props) { /* ... */ }
export function bootstrap() { /* ... */ }
```

#### JS沙箱

动态导入ESM会导致脚本脱离js沙箱环境。如果我们不可避免需要**set/get** `window`对象。我们需要使用暴露的代理对象`windowX`。

```javascript
windowX.val = "Hello World"; // set
windowX.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ // get
```

#### 多环境部署

Vite暂不支持像[__webpack_public_path__](https://webpack.js.org/guides/public-path/#on-the-fly)一样的运行时publicPath技术。我们可以使用[vite-plugin-dynamic-base](https://github.com/chenxch/vite-plugin-dynamic-base)代替。但是它会修改我们的脚本文件地址，所以我们需要使用`urlTransform`去修正。

```javascript
import { defineConfig } from 'vite'
import qiankun from 'vite-plugin-qiankun-x'
import { dynamicBase } from 'vite-plugin-dynamic-base'

export default defineConfig({
    plugins: [
        qiankun('your-micro-app-name', {
            // 修改脚本地址
            urlTransform: (ori) => ori.replace('/__dynamic_base__', ''),
        }),
        dynamicBase({
            publicPath: 'window.__dynamic_base__',
            transformIndexHtml: true
        })
    ],
    base: process.env.NODE_ENV === "production" ? "/__dynamic_base__/" : "/",
})
```

然后在任何代码执行之前，设置`window.__dynamic_base__`。比如在`index.html`中。

```html
<!-- index.html -->
<html>
  <head>
    <!-- ... -->
    <script>
      window.__dynamic_base__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || ''
    </script>
  </head>
  <!-- ... -->
</html>
```

#### 样式隔离

如果我们使用严格沙箱模式（它是默认的），那么qiankun提供的两种样式隔离方案将不会生效。包括`strictStyleIsolation`和`experimentalStyleIsolation`。

如果我们使用loose沙箱模式。这两种隔离方案也存在不少的bug。这是qiankun逻辑上的漏洞。我已经提交了两个issue：[#3018](https://github.com/umijs/qiankun/issues/3018)和[#3019](https://github.com/umijs/qiankun/issues/3019)。一旦qiankun修复，则可以使用这两种样式隔离方案。

所以目前，只能依靠微应用自己去处理样式隔离。可以使用：`CSS in JS`、`统一命名前缀`、`CSS modules`。

## 致谢

本插件是受[vite-plugin-qiankun](https://github.com/tengmaoqing/vite-plugin-qiankun)的启发。