// Imports from the 'managers' folder
import BaseLayerController from './managers/BaseLayerController.js';
import OverlayManager from './managers/OverlayManager.js';
import UserLocationManager from './managers/UserLocationManager.js';
import ScreenshotManager from './managers/ScreenshotManager.js';
import ShareManager from './managers/ShareManager.js';
import DrawingManager from './managers/DrawingManager.js';
import FavoriteManager from './managers/FavoriteManager.js';
import UIManager from './managers/UIManager.js';

class ZoekMapApp {
  constructor(mapId) {
    this.map = L.map(mapId).setView([50.85, 4.35], 9);
    this.map.zoomControl.setPosition('bottomright');
    
    // Instantiate Managers
    this.baseLayerCtrl = new BaseLayerController(this.map, "base-layer-select");
    this.overlayManager = new OverlayManager(this.map);
    this.drawingManager = new DrawingManager(this.map);
    
    // Favorite Manager needs DrawingManager instance
    this.favManager = new FavoriteManager(this.map, this.drawingManager, document.getElementById('favoritesList'));
    
    this.userLocManager = new UserLocationManager(this.map, 'autoPanToggle');
    this.screenshotManager = new ScreenshotManager(this.map, "copyScreenshotBtn");
    
    this.init();
  }

  init() {
    this.setupBaseLayers();
    this.setupOverlays();
    this.setupGeocoder();
    
    // Initialize UI Logic
    UIManager.init({ 
      favManager: this.favManager, 
      drawingManager: this.drawingManager 
    });

    // Handle Shared Link
    const shared = ShareManager.loadSharedFavorite();
    if (shared) {
      this.drawingManager.loadGeoJSON(shared.shapes);
      this.map.setView(shared.center, shared.zoom);
    }
  }

  setupBaseLayers() {
    const bases = [
      { key: "googleHybrid", label: "Google Hybrid", url: "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}", icon: "https://www.google.com/favicon.ico" },
      { key: "googleSatellite", label: "Google Satellite", url: "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", icon: "https://www.google.com/favicon.ico" },
      { key: "googleTerrain", label: "Google Terrain", url: "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", icon: "https://www.google.com/favicon.ico" },
      { key: "osm", label: "OpenStreetMap", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", icon: "https://www.openstreetmap.org/favicon.ico" },
      { key: "cartoLight", label: "Carto Light", url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", icon: "https://carto.com/favicon.ico" },
      { key: "cartoDark", label: "Carto Dark", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", icon: "https://carto.com/favicon.ico" },
      { key: "esri", label: "ESRI World Imagery", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", icon: "https://www.arcgis.com/sharing/rest/community/users/esri/info/esri_150.jpg" }
    ];

    bases.forEach(b => {
      this.baseLayerCtrl.addBase(b.key, {
        label: b.label,
        icon: b.icon,
        tileLayer: L.tileLayer(b.url, { subdomains: ["mt0", "mt1", "mt2", "mt3"], attribution: b.label })
      });
    });
  }

  setupOverlays() {
    // 1. Ferraris (Combined)
    this.overlayManager.register('ferrarisToggle', 'opacitySliderFerraris', [
      {
        type: 'tile',
        url: 'https://geo.api.vlaanderen.be/HISTCART/wmts?service=WMTS&request=GetTile&version=1.0.0&layer=ferraris&style=&tilematrixset=GoogleMapsVL&format=image/png&tilematrix={z}&tilerow={y}&tilecol={x}',
        bounds: [[50.685, 2.53], [51.520, 5.92]],
        attribution: '© Vlaanderen'
      },
      {
        type: 'wms',
        url: 'https://geoservices.wallonie.be/arcgis/services/CARTES_ANCIENNES/FERRARIS/MapServer/WMSServer',
        layers: '0',
        bounds: [[49.451080, 2.560669], [50.956140, 6.498683]],
        attribution: '© SPW – Ferraris',
        version: '1.3.0'
      }
    ], true);

    // 2. GRB
    this.overlayManager.register('grbToggle', 'opacitySliderGRB', {
      type: 'tile',
      url: 'https://geo.api.vlaanderen.be/GRB/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=grb_bsk&STYLE=&TILEMATRIXSET=GoogleMapsVL&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png',
      bounds: [[50.685, 2.53], [51.52, 5.92]],
      attribution: '© Vlaanderen GRB'
    });

    // 3. Hillshade
    this.overlayManager.register('hillshadeToggle', 'opacitySliderHillshade', {
      type: 'tile',
      url: 'https://geo.api.vlaanderen.be/DHMV/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=DHMV_II_HILL_25cm&STYLE=&TILEMATRIXSET=GoogleMapsVL&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png',
      bounds: [[50.64, 2.52], [51.51, 5.94]],
      attribution: '© Vlaanderen DHMV II'
    });

    // 4. DHMV (WMS)
    this.overlayManager.register('dhmvToggle', 'opacitySliderDhmv', {
      type: 'wms',
      url: 'https://geo.api.vlaanderen.be/DHMV/wms',
      layers: 'DHMVII_DTM_1m',
      bounds: [[50.64, 2.52], [51.51, 5.94]],
      attribution: '© Vlaanderen',
      version: '1.3.0'
    });
  }

  setupGeocoder() {
    L.Control.geocoder({ 
      defaultMarkGeocode: true, 
      placeholder: 'Search location...', 
      errorMessage: 'Not found' 
    })
    .on('markgeocode', (e) => this.map.setView(e.geocode.center, 16))
    .addTo(this.map);
  }
}

// Start the App
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ZoekMapApp('map');
});
