export type Configuration = {
  /** 
   * Transform the url of script in index.html.
   */
  urlTransform?: (url: string) => string
}