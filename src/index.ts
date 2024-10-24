import { PluginOption } from "vite";
import { load } from "cheerio";
import { Config } from "./types";

/** Main script, prepend to <head> later. */
function createInjectScript(appName: string): string {
  return `
  /** --- This is a generated script by [vite-plugin-qiankun-x] --- */
  // expose a new window object
  window.windowX = (window.proxy || window)
  // async import function
  var asyncImport = (src) => {
    return import((window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || '') + '..' + src)
  }
  // real ESM module
  var realModule = null
  // save the unexecuted tasks
  var taskQueue = []
  // wrapper
  function wrapLifecycle(lifecycleName) {
    return (props) => new Promise((resolve) => {
      if (realModule) {
        // real module already loaded
        // call the lifecycle hook directly
        resolve(realModule[lifecycleName](props))
      } else {
        // real module not loaded yet
        // save the resolve function and call after module loaded
        taskQueue.push(() => {
          resolve(realModule[lifecycleName](props))
        })
      }
    })
  }
  // bind wrapped lifecycle hooks to window
  window['${appName}'] = {
    bootstrap: wrapLifecycle('bootstrap'),
    mount: wrapLifecycle('mount'),
    unmount: wrapLifecycle('unmount'),
    update: wrapLifecycle('update')
  }
  // expose load function
  window.__xLoadModule__ = (src) => {
    asyncImport(src).then((mod) => {
      console.log('module loaded', mod)
      // only process main module
      if (mod.mount && mod.unmount) {
        realModule = mod
        // execute all saved tasks
        taskQueue.forEach((task) => task())
        taskQueue.length = 0
      }
    })
  }
  `;
}

function convertESMScript(moduleScriptSrcUrl: string): string {
  return `window.__xLoadModule__('${moduleScriptSrcUrl}')`;
}

export default function pluginEntry(
  appName: string,
  config: Config
): PluginOption {
  function inlineToUrl(inlineScript: string): string {
    return `data:application/javascript,${encodeURIComponent(inlineScript)}`;
  }

  const { urlTransform } = config;

  return [
    {
      // this plugin keeps all export of entry script
      name: "qiankun:keep-exports",
      // only build phase
      apply: "build",
      config: () => ({
        build: { rollupOptions: { preserveEntrySignatures: "exports-only" } },
      }),
      // must run after vite:build
      enforce: "post",
      transform(code, id) {
        // entry script: replace import with export
        if (id.endsWith("html")) {
          return code.replaceAll("import", "export * from");
        }
        return null;
      },
    },
    {
      // this plugin transforms index.html
      name: "qiankun:transform-html",
      transformIndexHtml(html) {
        const $html = load(html);
        // prepend our main script
        $html("head").prepend(
          `<script>${createInjectScript(appName)}</script>`
        );

        // pick all ESM scripts, and convert them
        $html('script[type="module"]').each((_, el) => {
          const $el = $html(el);
          let src = $el.attr("src");

          if (!src) {
            // inline script
            const inlineScriptContent = $el.html();
            // empty script, ignore
            if (!inlineScriptContent) return;
            // convert to url
            src = inlineToUrl(inlineScriptContent);
          } else if (urlTransform) {
            src = urlTransform(src);
          }

          // remove src and type attribute
          $el.removeAttr("src");
          $el.removeAttr("type");

          // set html with converted content
          $el.html(convertESMScript(src));
        });

        return $html.html();
      },
    },
  ];
}
