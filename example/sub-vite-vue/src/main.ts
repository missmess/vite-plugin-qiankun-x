import "./assets/main.scss";

import { createApp, type App as VueApp } from "vue";
import App from "./App.vue";

let vueApp: VueApp | null = null;
function render(props: any = {}) {
  const { container } = props;
  vueApp = createApp(App);
  const rootId = "#vite-vue-root";
  vueApp.mount(container ? container.querySelector(rootId) : rootId);
}

if (!windowX.__POWERED_BY_QIANKUN__) {
  render();
}

export function bootstrap() {
  console.log("[vite-vue] app bootstrap");
}

export function mount(props: any) {
  console.log("[vite-vue] app mount, prop is", props);
  render(props);
}

export function unmount() {
  console.log("[vite-vue] app unmount");
  vueApp?.unmount();
}
