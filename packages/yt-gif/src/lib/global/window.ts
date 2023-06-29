export function assignToPrototype() {
  queryAllasArr()
}

function queryAllasArr() {
  Element.prototype.queryAllasArr = Document.prototype.queryAllasArr = function <type = Element>(
    selector: string
  ): type[] {
    return Array.from(this.querySelectorAll(selector)).map(el => el as unknown as type)
  }
}
//window.Gif = <typeof window.Gif>{}
//window.YT_GIF_SETTINGS_PAGE_INIT = <typeof window.YT_GIF_SETTINGS_PAGE_INIT>{}
//window.YT_GIF_SETTINGS_PAGE = <typeof window.YT_GIF_SETTINGS_PAGE>{}
//window.YT_GIF_DIRECT_SETTINGS = <typeof window.YT_GIF_DIRECT_SETTINGS>{}
//window.YT = <typeof window.YT>{}
//window.roamAlphaAPI = <typeof window.roamAlphaAPI>{}
//window.YT_GIF_OBSERVERS = <typeof window.YT_GIF_OBSERVERS>{}
//window.ddm_html = <typeof window.ddm_html>{}
//window.YTGIF = <typeof window.YTGIF>{}
