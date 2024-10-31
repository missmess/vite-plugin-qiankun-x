/** 
 * convert javascript string to data URL.
 */
export function scriptToDataUrl(inlineScript: string): string {
  const id = randomId();
  return `data:application/javascript,${encodeURIComponent(inlineScript + `\n//# sourceURL=${id}`)}`;
}

export function randomId() {
  return Math.random().toString(36).slice(2);
}