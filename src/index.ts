import { PluginOption } from "vite";
import { load } from "cheerio";
import { Configuration } from "./types";
import { convertInlineScript, convertUrlScript } from "./converter";
import { scriptToDataUrl } from "./utils";

/** Main script, prepend to <head>. */
function createInjectScriptSnipet(appName: string): string {
  const codeRunInSandbox = `
  /** --- This is a generated script by [vite-plugin-qiankun-x] --- */
  const proxy = window
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
  // bind wrapped lifecycle hooks to global
  proxy['${appName}'] = {
    bootstrap: wrapLifecycle('bootstrap'),
    mount: wrapLifecycle('mount'),
    unmount: wrapLifecycle('unmount'),
    update: wrapLifecycle('update'),
    __xLoadModule__: (src) => {
      return import(src).then((mod) => {
        // console.log('module loaded', mod)
        // only process main module
        if (mod.mount && mod.unmount) {
          realModule = mod
          // execute all saved tasks
          taskQueue.forEach((task) => task())
          taskQueue.length = 0
        }
        return mod
      })
    }
  }`;

  const codeRunInRealWorld = `
  console.log("设置windowX", window.proxy, window);
  window.windowX = window.proxy || window
  `;

  return `${codeRunInSandbox}
  // Inject windowX to real window
  import("${scriptToDataUrl(codeRunInRealWorld)}")
  `;
}

/** Plugin Entry */
export default function pluginEntry(
  appName: string,
  configuration: Configuration = {}
): PluginOption {
  const { urlTransform } = configuration;

  return [
    {
      // This plugin keeps all export of entry script
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
      // This plugin modify vite client script.
      //
      // Vite use `insertAdjacentElement` to insert <style> but qiankun
      // doest hijack `insertAdjacentElement`. which will cause:
      // 1. CSS rules won't be rewrite with special prefix.
      // 2. <style> tag won't be re-inserted when app doing rebuild.
      // see issue: https://github.com/umijs/qiankun/issues/3018
      //
      // qiankun doesn't fix this issue now, so we can only compromise 
      // and modify the vite script.
      name: "qiankun:fixup-vite",
      // only serve phase
      apply: "serve",
      transform(code, id) {
        // match vite client script
        if (id.endsWith("client/client.mjs")) {
          // replace `insertAdjacentElement` with `appendChild`
          return code.replace(
            'lastInsertedStyle.insertAdjacentElement("afterend", style);',
            "document.head.appendChild(style);"
          );
        }
        return null;
      },
    },
    {
      // This plugin transforms index.html
      name: "qiankun:transform-html",
      transformIndexHtml(html) {
        const $html = load(html);
        // prepend our main script
        $html("head").prepend(
          `<script>${createInjectScriptSnipet(appName)}</script>`
        );

        // pick all ESM scripts, and convert them
        $html('script[type="module"]').each((_, el) => {
          const $el = $html(el);
          let src = $el.attr("src");

          // remove src and type attribute
          $el.removeAttr("src");
          $el.removeAttr("type");

          if (!src) {
            // inline script
            const inlineScriptContent = $el.html();
            // empty script, ignore
            if (!inlineScriptContent) return;
            // convert inline script
            const convertedScript = convertInlineScript(
              appName,
              inlineScriptContent
            );
            const dataUrl = scriptToDataUrl(convertedScript);
            $el.html(`import("${dataUrl}")`);
            return;
          }

          if (urlTransform) {
            src = urlTransform(src);
          }
          // set html with converted content
          $el.html(convertUrlScript(appName, src));
        });

        return $html.html();
      },
    },
  ];
}
