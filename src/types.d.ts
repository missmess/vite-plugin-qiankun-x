export type Config = {
  /** 
   * Transform the url of script in index.html.
   */
  urlTransform?: (url: string) => string
}