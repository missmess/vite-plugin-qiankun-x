# vite-plugin-qiankun-x

<!-- [![NPM version](https://img.shields.io/npm/v/vite-plugin-qiankun-x?color=a1b858&label=)](https://www.npmjs.com/package/vite-plugin-qiankun-x) -->

  <a href="https://www.npmjs.com/package/vite-plugin-qiankun-x">
    <img src="https://img.shields.io/npm/v/vite-plugin-qiankun-x" alt="Version" />
  </a>
  <a href="https://www.npmjs.com/package/vite-plugin-qiankun-x">
    <img src="https://img.shields.io/github/languages/top/missmess/vite-plugin-qiankun-x" alt="Languages" />
  </a>
  <a href="https://www.npmjs.com/package/vite-plugin-qiankun-x">
    <img src="https://img.shields.io/npm/l/vite-plugin-qiankun-x" alt="License" />
  </a>
  <a href="https://github.com/AttoJS/vite-plugin-qiankun-x/stargazers">
    <img src="https://img.shields.io/github/stars/missmess/vite-plugin-qiankun-x" alt="Star" />
  </a>
  <a href="https://www.npmjs.com/package/vite-plugin-qiankun-x">
    <img src="https://img.shields.io/npm/dm/vite-plugin-qiankun-x" alt="Download" />
  </a>

A Vite plugin for [qiankun](https://qiankun.umijs.org/zh) micro-app. Support Vue and React.

## Features

- Zero-Setup, just add the plugin and run.

- Keep ESM features of Vite.

- No side effects, can run independently or within qiankun.

- Can cooperate with [vite-plugin-dynamic-base](https://github.com/chenxch/vite-plugin-dynamic-base) for multi-environment deployment.

## Installation

```bash
npm i vite-plugin-qiankun-x -D
```

## Usage

#### Basic

Add plugin at `vite.config.js`.

```javascript
import { defineConfig } from 'vite'
import qiankun from 'vite-plugin-qiankun-x'

export default defineConfig({
    plugins: [qiankun('your-micro-app-name')],
})
```

Of course, you must **export** lifecycle hooks in your entry script (Normally main.ts). It is required by qiankun.

```javascript
export function bootstrap() { /* ... */ }
export function mount(props) { /* ... */ }
export function bootstrap() { /* ... */ }
```

#### Multi Environment Deployment

Vite doesn't support runtime publicPath like [__webpack_public_path__](https://webpack.js.org/guides/public-path/#on-the-fly). We can use [vite-plugin-dynamic-base](https://github.com/chenxch/vite-plugin-dynamic-base) instead. It will modify our script src, so we need to use `urlTransform` to correct it.

```javascript
import { defineConfig } from 'vite'
import qiankun from 'vite-plugin-qiankun-x'
import { dynamicBase } from 'vite-plugin-dynamic-base'

export default defineConfig({
    plugins: [
        qiankun('your-micro-app-name', {
            // correct the script src
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

Then assign `window.__dynamic_base__` before any code runs. For example, in `index.html`.

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

#### JS sandbox

Dynamically importing ESM will cause the script to escape the js sandbox environment. If we cann't avoid set/get `window` (although this is rare), we need to use an exposed proxy `windowX`. 

```javascript
windowX.val = "Hello World";
```

## Thanks

This plugin is inspired by [vite-plugin-qiankun](https://github.com/tengmaoqing/vite-plugin-qiankun).