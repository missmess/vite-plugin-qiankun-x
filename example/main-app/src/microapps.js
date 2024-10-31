import { registerMicroApps, start } from "qiankun";

/** @type {import('qiankun').RegistrableApp[]} */
export const microApps = [
  {
    name: "vite-react",
    entry: "//localhost:6660",
    container: "#micro-container",
    activeRule: "/sub-react",
  },
  {
    name: "vite-vue",
    entry: "//localhost:6680",
    container: "#micro-container",
    activeRule: "/sub-vue",
  }
]

registerMicroApps(microApps);

start({
  sandbox: {
    // Both style isolation solutions doesn't work in "strict" sandbox.
    // It should works in "loose" sandbox by design, but there already has a bug in qiankun.
    // see: https://github.com/umijs/qiankun/issues/3019
    // So, we have to comment it for now, and do style isolation in micro-apps ourself.
    // strictStyleIsolation: true,
    // loose: true,
  },
});
