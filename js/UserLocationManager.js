    class UserLocationMarker {
      constructor(map) {
        this.map = map;
        this.marker = null;
        this.lastPosition = null;

        this._createPane();
        this._injectStyles();
      }

      _createPane() {
        if (!this.map.getPane('userLocationPane')) {
          this.map.createPane('userLocationPane');
          const pane = this.map.getPane('userLocationPane');
          pane.style.zIndex = 10000;
          pane.style.pointerEvents = 'none';
        }
      }

      updatePosition(lat, lng) {
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
      }

      _injectStyles() {
        if (document.getElementById('pulse-style')) return;

        const css = `
      .user-pulse-marker {
        position: relative;
      }
      .user-pulse-marker::before {
        content: "";
        width: 14px;
        height: 14px;
        background: #4285f4;
        border-radius: 50%;
        border: 1px solid #fff;
        position: absolute;
        top: 3px;
        left: 3px;
        box-shadow: 0 0 6px rgba(66,133,244,0.6);
      }
      .user-pulse-marker::after {
        content: "";
        width: 15px;
        height: 15px;
        background: rgba(66,133,244,0.4);
        border-radius: 50%;
        position: absolute;
        top: 3px;
        left: 3px;
        animation: user-pulse 1.6s ease-out infinite;
      }
      @keyframes user-pulse {
        0% { transform: scale(1); opacity: 0.9; }
        100% { transform: scale(2.8); opacity: 0; }
      }
    `;

        const style = document.createElement('style');
        style.id = 'pulse-style';
        style.textContent = css;
        document.head.appendChild(style);
      }
    }