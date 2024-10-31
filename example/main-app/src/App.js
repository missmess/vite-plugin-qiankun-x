import React from "react";
import logo from "./logo.svg";
import "./App.css";
import useRoute from "./useRoute";
import { microApps } from "./microapps";

const AppRoutes = [{ name: "Home", activeRule: "/" }, ...microApps];

function App() {
  const route = useRoute();

  return (
    <div className="App">
      <AppHeader />

      <section className="App-central">
        <aside className="App-sidebar">
          <span className="app-tip">micro apps</span>
          <RouteMenu route={route} />
        </aside>

        <main className="App-content">
          {/* micro-app container */}
          <div id="micro-container" />
          {route === "/" && <Welcome />}
        </main>
      </section>
    </div>
  );
}

/** App Header Comp */
function AppHeader() {
  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <span className="App-name">Qiankun Main App</span>

      <a
        className="Github-tx"
        href="https://github.com/missmess/vite-plugin-qiankun-x"
        target="__blank"
      >
        <img src="/github.png" className="Github-icon" alt="github" />
        <span>give me a star</span>
      </a>
    </header>
  );
}

/** Route Menu Comp */
function RouteMenu({ route }) {
  return (
    <ul className="app-route-list">
      {AppRoutes.map((app) => (
        <li
          key={app.name}
          className={`app-route-item ${
            route === app.activeRule ? "active" : ""
          }`}
          onClick={() => {
            window.history.pushState(null, app.name, app.activeRule);
          }}
        >
          {app.name}
        </li>
      ))}
    </ul>
  );
}

/** Welcome Comp */
function Welcome() {
  return (
    <div className="App-welcome">
      <div>
        <h2>Welcome! 😊</h2>
        <p>
          This is a demo for{" "}
          <strong>
            <a
              href="https://github.com/missmess/vite-plugin-qiankun-x"
              target="__blank"
            >
              vite-plugin-qiankun-x
            </a>
          </strong>
          .
        </p>
        <div className="divider" />
        <p>It contains one main-app and two micro-apps:</p>
        <p>
          <strong>vite-react</strong>: show the basic usage.
        </p>
        <p>
          <strong>vite-vue</strong>: show the ability to support{" "}
          <code>Multi-Environment Deployment</code>.
        </p>
        <div className="divider" />
        <p>Follow the steps below to see the result:</p>
        <ul>
          <li>
            First, startup the two micro-apps with command <code>yarn dev</code>
            .
          </li>
          <li>
            Second, click on the route menu in left sidebar to show micro-app
            page.
          </li>
          <li>
            Optionally, you can open micro-apps in a new tab, they can run
            independently.
          </li>
        </ul>
      </div>{" "}
    </div>
  );
}

export default App;
