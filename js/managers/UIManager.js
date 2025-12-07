const UIManager = {
  cache: {
    drawer: document.getElementById('drawer'),
    menuBtn: document.getElementById('menuBtn'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    newViewBtn: document.getElementById('newViewBtn'),
    saveNewViewBtn: document.getElementById('saveNewViewBtn'),
    cancelNewViewBtn: document.getElementById('cancelNewViewBtn'),
    saveCancelWrapper: document.getElementById('saveCancelWrapper'),
    favoritesList: document.getElementById('favoritesList'),
    editBanner: document.getElementById('editBanner'),
    editingFavName: document.getElementById('editingFavName'),
    saveChangesBtn: document.getElementById('saveChangesBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn')
  },

  favManager: null,
  drawingManager: null,

  init(managers) {
    this.favManager = managers.favManager;
    this.drawingManager = managers.drawingManager;

    this.cache.menuBtn.addEventListener('click', () => { this.cache.drawer.classList.add('open'); this.cache.menuBtn.classList.add('hidden'); });
    this.cache.closeDrawerBtn.addEventListener('click', () => { this.cache.drawer.classList.remove('open'); this.cache.menuBtn.classList.remove('hidden'); });

    this.cache.newViewBtn.addEventListener('click', () => {
      this.drawingManager.clear();
      this.drawingManager.enableEditMode();
      this.cache.newViewBtn.style.display = 'none';
      this.cache.saveCancelWrapper.style.display = 'flex';
    });

    this.cache.saveNewViewBtn.addEventListener('click', () => {
      const name = prompt('Enter a name for this view:');
      if (!name) return;
      this.favManager.addFavorite(name);
      this.drawingManager.disableEditMode();
      this.drawingManager.clear();
      this.cache.saveCancelWrapper.style.display = 'none';
      this.cache.newViewBtn.style.display = 'flex';
    });

    this.cache.cancelNewViewBtn.addEventListener('click', () => {
      this.drawingManager.clear();
      this.drawingManager.disableEditMode();
      this.cache.saveCancelWrapper.style.display = 'none';
      this.cache.newViewBtn.style.display = 'flex';
    });

    this.cache.saveChangesBtn.addEventListener('click', () => {
      this.favManager.saveEditedShapes();
      this.hideEditBanner();
    });

    this.cache.cancelEditBtn.addEventListener('click', () => {
      if (!confirm('Discard edits?')) return;
      this.favManager.cancelEdit();
      this.hideEditBanner();
    });
  },

  showEditBanner(name) {
    this.cache.editBanner.style.display = 'block';
    this.cache.editingFavName.textContent = 'Editing: ' + name;
  },

  hideEditBanner() {
    this.cache.editBanner.style.display = 'none';
    this.cache.editingFavName.textContent = '';
  }
};

export default UIManager;
