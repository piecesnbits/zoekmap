export default class DrawingManager {
  constructor(map) {
    this.map = map;
    this.paneName = "custom-drawing-pane";
    this._ensurePane();
    this.drawnItems = new L.FeatureGroup(null, { pane: this.paneName });
    this.map.addLayer(this.drawnItems);

    this.drawControl = new L.Control.Draw({
      position: 'topright',
      draw: { polygon: true, polyline: false, rectangle: false, circle: false, marker: true },
      edit: false
    });
    this.editControl = null;
    this.map.on(L.Draw.Event.CREATED, (e) => this.onCreated(e));
  }

  _ensurePane() {
    if (!this.map.getPane(this.paneName)) {
      const pane = this.map.createPane(this.paneName);
      pane.style.zIndex = 700;
      pane.style.pointerEvents = "auto";
    }
  }

  onCreated(event) {
    const layer = event.layer;
    layer.options.pane = this.paneName; 
    this.drawnItems.addLayer(layer);
  }

  clear() { this.drawnItems.clearLayers(); }

  loadGeoJSON(geojson) {
    this.clear();
    if (!geojson || !geojson.features?.length) return;
    L.geoJSON(geojson, {
      pane: this.paneName,
      pointToLayer: (feature, latlng) => L.marker(latlng, { pane: this.paneName })
    }).eachLayer(layer => this.drawnItems.addLayer(layer));
  }

  toGeoJSON() { return this.drawnItems.toGeoJSON(); }

  enableEditMode() {
    if (this.editControl) return;
    if (this.drawControl) this.map.removeControl(this.drawControl);

    this.editControl = new L.Control.Draw({
      position: 'topright',
      draw: { polygon: true, polyline: false, rectangle: false, circle: false, marker: true },
      edit: { featureGroup: this.drawnItems, remove: true }
    });
    this.map.addControl(this.editControl);
  }

  disableEditMode() {
    if (this.editControl) {
      this.map.removeControl(this.editControl);
      this.editControl = null;
    }
    if (!this.drawControl) {
      this.drawControl = new L.Control.Draw({
        position: 'topright',
        draw: { polygon: true, polyline: false, rectangle: false, circle: false, marker: true },
        edit: false
      });
    }
    this.map.addControl(this.drawControl);
  }
}
