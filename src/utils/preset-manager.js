// Preset Manager
// Manage, save, and load presets for PSY LOOPER

export class PresetManager {
  constructor() {
    this.presets = new Map();
    this.categories = new Map();
    this.currentPreset = null;
  }

  addPreset(id, preset, category = 'default') {
    this.presets.set(id, { ...preset, id, category });

    if (!this.categories.has(category)) {
      this.categories.set(category, new Set());
    }
    this.categories.get(category).add(id);
  }

  removePreset(id) {
    const preset = this.presets.get(id);
    if (preset) {
      this.presets.delete(id);
      const categorySet = this.categories.get(preset.category);
      if (categorySet) {
        categorySet.delete(id);
      }
    }
  }

  getPreset(id) {
    return this.presets.get(id);
  }

  getPresetsByCategory(category) {
    const ids = this.categories.get(category);
    if (!ids) return [];
    return Array.from(ids).map((id) => this.presets.get(id));
  }

  getAllPresets() {
    return Array.from(this.presets.values());
  }

  getCategories() {
    return Array.from(this.categories.keys());
  }

  setCurrentPreset(id) {
    const preset = this.presets.get(id);
    if (preset) {
      this.currentPreset = preset;
      return preset;
    }
    return null;
  }

  getCurrentPreset() {
    return this.currentPreset;
  }

  duplicatePreset(id, newId) {
    const preset = this.presets.get(id);
    if (preset) {
      const newPreset = { ...preset, id: newId };
      this.addPreset(newId, newPreset, preset.category);
      return newPreset;
    }
    return null;
  }

  renamePreset(id, newName) {
    const preset = this.presets.get(id);
    if (preset) {
      preset.name = newName;
      return preset;
    }
    return null;
  }

  recategorizePreset(id, newCategory) {
    const preset = this.presets.get(id);
    if (preset) {
      // Remove from old category
      const oldCategorySet = this.categories.get(preset.category);
      if (oldCategorySet) {
        oldCategorySet.delete(id);
      }

      // Add to new category
      if (!this.categories.has(newCategory)) {
        this.categories.set(newCategory, new Set());
      }
      this.categories.get(newCategory).add(id);

      preset.category = newCategory;
      return preset;
    }
    return null;
  }

  searchPresets(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAllPresets().filter((preset) => {
      return (
        preset.name.toLowerCase().includes(lowerQuery) ||
        preset.category.toLowerCase().includes(lowerQuery) ||
        preset.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  export() {
    return {
      presets: Array.from(this.presets.entries()),
      currentPreset: this.currentPreset ? this.currentPreset.id : null,
    };
  }

  import(data) {
    this.presets.clear();
    this.categories.clear();

    if (data.presets) {
      data.presets.forEach(([id, preset]) => {
        this.addPreset(id, preset, preset.category || 'default');
      });
    }

    if (data.currentPreset) {
      this.setCurrentPreset(data.currentPreset);
    }
  }

  saveToLocalStorage(key = 'psy-looper-presets') {
    const data = this.export();
    localStorage.setItem(key, JSON.stringify(data));
  }

  loadFromLocalStorage(key = 'psy-looper-presets') {
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      this.import(data);
      return true;
    }
    return false;
  }
}

export const presetManager = new PresetManager();
