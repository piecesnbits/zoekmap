export default class ScreenshotManager {
  constructor(map, buttonId) {
    this.map = map;
    this.button = document.getElementById(buttonId);
    if(this.button) this._attachEvents();
  }

  _attachEvents() {
    this.button.addEventListener("click", () => this.copyScreenshot());
  }

  async copyScreenshot() {
    try {
      const mapEl = document.getElementById("map");
      const canvas = await html2canvas(mapEl, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        scale: window.devicePixelRatio
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      alert("Screenshot copied to clipboard!");
    } catch (err) {
      console.error(err);
      alert("Browser may not support clipboard images.");
    }
  }
}
