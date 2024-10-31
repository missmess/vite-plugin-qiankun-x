/** patch url with qiankun injected publicPath */
function patchUrlWithQiankunPath(url: string): string {
  const injectedPath =
    "((window.proxy || window).__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || '')";
  if (url.startsWith("/")) {
    return `${injectedPath} + '..' + '${url}'`;
  } else if (url.startsWith("./") || url.startsWith("../")) {
    return `${injectedPath} + '${url}'`;
  } else {
    return `'${url}'`;
  }
}

/** 
 * convert ESM url to general script. Module will be dynamic imported.
 * 
 * For example:
 * - Input: "/src/main.ts"
 * - Output: window.__xLoadModule__(window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ + 'src/main.ts')
 * 
 * @param scriptSrcUrl src attribute of script tag
 */
export function convertUrlScript(appName: string, scriptSrcUrl: string): string {
  const patchedUrl = patchUrlWithQiankunPath(scriptSrcUrl);
  return `(window.proxy || window)["${appName}"].__xLoadModule__(${patchedUrl})`;
}

/** 
 * convert ESM inline script to general script. All modules will be dynamic imported. 
 * 
 * For example:
 * - Input: "import variable from '/fake.ts'"
 * - Output: "(async () => { const variable = await window.__xLoadModule__(window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ + 'fake.ts') })()"
 * 
 * @param inlineScript inline script content
 */
export function convertInlineScript(appName: string, inlineScript: string): string {
  let result = inlineScript;
  // 1. match regex: import xx from "xxxx"
  const importRegex = /import\s+(\{?\s*\w+\s*\}?)\s+from\s+["'](.+?)["']/g;
  // replace to: const xx = await import("xxxx")
  result = result.replace(importRegex, (match, variable, path) => {
    const patchedUrl = patchUrlWithQiankunPath(path);
    return `const ${variable} = await (window.proxy || window)["${appName}"].__xLoadModule__(${patchedUrl})`;
  });
  // 2. match regex: import "xxxx"
  const importOnlyRegex = /import\s+["'](.+?)["']/g;
  // replace to: await import("xxxx")
  result = result.replace(importOnlyRegex, (match, path) => {
    const patchedUrl = patchUrlWithQiankunPath(path);
    return `await (window.proxy || window)["${appName}"].__xLoadModule__(${patchedUrl})`;
  });
  // 3. wrap with async function
  return `(async () => {\n${result}\n})()`;
}
