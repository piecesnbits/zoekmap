export default class BaseLayerController {
  constructor(map, selectId) {
    this.map = map;
    this.baseLayers = {};
    this.activeBase = null;
    this.originalSelect = document.getElementById(selectId);
    
    this.originalSelect.style.display = "none";
    this.dropdown = document.createElement("div");
    this.dropdown.className = "blc-dropdown";
    this.selected = document.createElement("div");
    this.selected.className = "blc-selected";
    this.selected.textContent = "Select base layer";
    this.dropdown.appendChild(this.selected);
    this.optionsContainer = document.createElement("div");
    this.optionsContainer.className = "blc-options";
    this.dropdown.appendChild(this.optionsContainer);
    this.originalSelect.parentNode.insertBefore(this.dropdown, this.originalSelect);

    this.selected.addEventListener("click", () => this.optionsContainer.classList.toggle("blc-show"));
    document.addEventListener("click", (e) => {
      if (!this.dropdown.contains(e.target)) this.optionsContainer.classList.remove("blc-show");
    });
  }

  addBase(key, config) {
    this.baseLayers[key] = config.tileLayer;
    const option = document.createElement("option");
    option.value = key;
    option.textContent = config.label;
    this.originalSelect.appendChild(option);

    const customOption = document.createElement("div");
    customOption.className = "blc-option";
    customOption.dataset.key = key;
    if (config.icon) {
      const img = document.createElement("img");
      img.src = config.icon;
      img.className = "blc-option-icon";
      customOption.appendChild(img);
    }
    const label = document.createElement("span");
    label.textContent = config.label;
    customOption.appendChild(label);

    customOption.addEventListener("click", () => {
      this.setBase(key);
      this.selected.innerHTML = "";
      if (config.icon) {
        const imgClone = customOption.querySelector("img").cloneNode();
        imgClone.className = "blc-selected-icon";
        this.selected.appendChild(imgClone);
      }
      const text = document.createElement("span");
      text.textContent = config.label;
      this.selected.appendChild(text);
      this.optionsContainer.classList.remove("blc-show");
      this.originalSelect.value = key;
    });

    this.optionsContainer.appendChild(customOption);
    if (!this.activeBase) customOption.click();
  }

  setBase(key) {
    const layer = this.baseLayers[key];
    if (!layer) return;
    if (this.activeBase) this.map.removeLayer(this.activeBase);
    layer.addTo(this.map);
    this.activeBase = layer;
  }
}
