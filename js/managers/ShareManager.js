export default class ShareManager {
  static compress(obj) {
    return LZString.compressToEncodedURIComponent(JSON.stringify(obj));
  }
  static decompress(str) {
    try { return JSON.parse(LZString.decompressFromEncodedURIComponent(str)); } catch { return null; }
  }
  static generateShareURL(favObj) {
    const payload = this.compress(favObj);
    const url = new URL(window.location.href);
    url.searchParams.set('favdata', payload);
    return url.toString();
  }
  static loadSharedFavorite() {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('favdata');
    if (!data) return null;
    return this.decompress(data);
  }
}
