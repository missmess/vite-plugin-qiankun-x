import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.tsx";

let reactRoot: any = null;
function render(props: any = {}) {
  if (reactRoot) {
    reactRoot.unmount();
  }
  const container = props.container || document;
  reactRoot = createRoot(container.querySelector("#vite-react-root"));
  reactRoot.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

if (!windowX.__POWERED_BY_QIANKUN__) {
  render();
}

export function bootstrap() {
  console.log("[vite-react] app bootstrap");
}

export function mount(props: any) {
  console.log("[vite-react] app mount, prop is", props);
  render(props);
}

export function unmount() {
  console.log("[vite-react] app unmount");
  reactRoot?.unmount();
}
