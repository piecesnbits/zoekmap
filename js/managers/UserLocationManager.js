export default class UserLocationManager {
  constructor(map, autoPanToggleId) {
    this.map = map;
    this.marker = null;
    this.lastPosition = null;
    this.autoPan = false;
    
    this._createPane();
    this._setupAutoPan(autoPanToggleId);
    this._setupLocateControl();
    this._startWatching();
  }

  _createPane() {
    if (!this.map.getPane('userLocationPane')) {
      this.map.createPane('userLocationPane');
      const pane = this.map.getPane('userLocationPane');
      pane.style.zIndex = 800;
      pane.style.pointerEvents = 'none';
    }
  }

  _setupAutoPan(toggleId) {
    const toggle = document.getElementById(toggleId);
    if(toggle) toggle.addEventListener('change', e => this.autoPan = e.target.checked);
  }

  _updatePosition(lat, lng) {
    const latlng = [lat, lng];
    this.lastPosition = latlng;

    if (!this.marker) {
      this.marker = L.marker(latlng, {
        pane: 'userLocationPane',
        icon: L.divIcon({
          className: 'user-pulse-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(this.map);
    } else {
      this.marker.setLatLng(latlng);
    }

    if (this.autoPan) {
        this.map.setView(latlng);
    }
  }

  _startWatching() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        pos => {
          this._updatePosition(pos.coords.latitude, pos.coords.longitude);
        },
        err => console.warn("Geolocation access denied", err),
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
  }

  _setupLocateControl() {
    const locateButton = L.control({ position: 'topright' });
    locateButton.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = `<a href="#" title="Go to my location" style="display:block;line-height:26px;text-align:center;color:inherit;"><span class="material-icons" style="vertical-align:middle;font-size:20px;">gps_fixed</span></a>`;
      div.onclick = (e) => {
        e.preventDefault();
        if (this.lastPosition) {
          this.map.setView(this.lastPosition, 16);
        } else {
          alert("Location not available yet");
        }
      };
      return div;
    };
    locateButton.addTo(this.map);
  }
}
