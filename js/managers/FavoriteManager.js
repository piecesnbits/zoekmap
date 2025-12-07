import ShareManager from './ShareManager.js';
import UIManager from './UIManager.js';

export default class FavoriteManager {
  constructor(map, drawingManager, listElement) {
    this.map = map;
    this.drawingManager = drawingManager;
    this.listElement = listElement;
    this.storageKey = 'favorites';
    this.data = [];
    this.activeIndex = null;
    this.editIndex = null;
    this.load();
  }

  load() {
    try { this.data = JSON.parse(localStorage.getItem(this.storageKey) || '[]'); }
    catch { this.data = []; }
    this._renderList();
  }

  saveStorage() { localStorage.setItem(this.storageKey, JSON.stringify(this.data)); }

  addFavorite(name) {
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    const shapes = this.drawingManager.toGeoJSON();
    this.data.push({ name, center, zoom, shapes });
    this.saveStorage();
    this._renderList();
    this.drawingManager.clear();
  }

  deleteFavorite(index) {
    if (this.editIndex === index) this.cancelEdit();
    this.data.splice(index, 1);
    this.saveStorage();
    this._renderList();
    this.drawingManager.clear();
  }

  openFavorite(index, options = { confirmDiscard: true }) {
    if (this.editIndex !== null && this.editIndex !== index && options.confirmDiscard) {
      if (!confirm('You have unsaved edits. Discard changes?')) return false;
      this.cancelEdit();
    }
    const fav = this.data[index];
    if (!fav) return false;
    this.map.setView(fav.center, fav.zoom);
    this.activeIndex = index;
    this.drawingManager.loadGeoJSON(fav.shapes || { type: 'FeatureCollection', features: [] });
    this.drawingManager.disableEditMode();
    return true;
  }

  enterEditMode(index) {
    const fav = this.data[index];
    if (!fav) return false;
    this.map.setView(fav.center, fav.zoom);
    if (this.editIndex !== null && this.editIndex !== index) {
      if (!confirm('You have unsaved edits. Discard changes?')) return false;
      this.cancelEdit();
    }
    this.editIndex = index;
    this.drawingManager.loadGeoJSON(fav.shapes || { type: 'FeatureCollection', features: [] });
    this.drawingManager.enableEditMode();
    return true;
  }

  saveEditedShapes() {
    if (this.editIndex === null) return false;
    const shapes = this.drawingManager.toGeoJSON();
    this.data[this.editIndex].shapes = shapes;
    this.saveStorage();
    this._renderList();
    this.cancelEdit();
    return true;
  }

  cancelEdit() {
    if (this.editIndex === null) return;
    const fav = this.data[this.editIndex];
    if (fav && fav.shapes) this.drawingManager.loadGeoJSON(fav.shapes);
    else this.drawingManager.clear();
    this.editIndex = null;
    this.drawingManager.disableEditMode();
    this.drawingManager.clear();
  }

  _renderList() {
    this.listElement.innerHTML = '';
    this.data.forEach((fav, i) => {
      const li = document.createElement('li');
      li.className = 'fav-row';

      const left = document.createElement('div');
      left.className = 'fav-left';
      const nameSpan = document.createElement('span');
      nameSpan.className = 'fav-name';
      nameSpan.textContent = fav.name;
      nameSpan.title = 'Open favorite (view only)';
      nameSpan.addEventListener('click', () => this.openFavorite(i, { confirmDiscard: true }));
      left.appendChild(nameSpan);

      const right = document.createElement('div');
      right.className = 'fav-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-small';
      editBtn.innerHTML = '<span class="material-icons">edit</span>';
      editBtn.title = 'Edit shapes';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        UIManager.showEditBanner(this.data[i].name);
        this.enterEditMode(i);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-small btn-delete';
      deleteBtn.innerHTML = '<span class="material-icons">close</span>';
      deleteBtn.title = 'Delete';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete favorite "${fav.name}"?`)) this.deleteFavorite(i);
      });

      const shareBtn = document.createElement('button');
      shareBtn.className = 'btn-small';
      shareBtn.innerHTML = '<span class="material-icons">share</span>';
      shareBtn.title = 'Share';
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = ShareManager.generateShareURL(this.data[i]);
        if (navigator.share) {
          navigator.share({ title: fav.name, text: 'Shared via Zoekmap', url });
        } else {
          navigator.clipboard.writeText(url);
          alert('Share link copied to clipboard');
        }
      });

      right.append(shareBtn, editBtn, deleteBtn);
      li.append(left, right);
      this.listElement.appendChild(li);
    });
  }
}
