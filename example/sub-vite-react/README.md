# React + TypeScript + Vite

This template comes from official Vite template.

```shell
npm create vite@latest my-vue-app -- --template react-ts
```

## As a qiankun micro-app

### JS sandbox

Due to the dynamic `import()`, our micro-app will run in **global window**. But we can use `windowX` as it's a **windowProxy** in qiankun environment and **real window** in independent environment.

### Style isolation

Currently, with qiankun2. We cannot use **style isolation** in "strict" sandbox.

It also doesn't work in "loose" sandbox due to [some bugs](https://github.com/umijs/qiankun/issues/3019) in qiankun.

Therefore, we use **SCSS** to do **style isolation** there.

## As a standalone app

This micro-app can run independently.