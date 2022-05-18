const fs = require("fs");
const path = require("path");

const productsFaker = require("./productsFaker");

const BASE_FILE_PATH = path.join(__dirname, "productos.txt");

class Contenedor {
  constructor() {
    this.filePath = BASE_FILE_PATH;
  }

  getFakeProducts(count) {
    return productsFaker.generateProducts(count);
  }

  async exists(id) {
    try {
      const entries = await this._getEntriesFromFile();
      const searchedEntry = entries.find((e) => e.id === id);
      return typeof searchedEntry !== "undefined";
    } catch (error) {
      throw error;
    }
  }

  async save(title, price, thumbnail) {
    try {
      const newEntry = { title, price, thumbnail };
      const entries = await this._getEntriesFromFile();
      let newEntryId = 1;
      if (entries.length > 0) {
        const entryIds = entries.map((e) => e.id);
        const maxId = Math.max(...entryIds);
        newEntryId = maxId + 1;
      }
      newEntry.id = newEntryId;
      entries.push(newEntry);
      await this._saveEntriesToFile(entries);
      return newEntry;
    } catch (error) {
      throw new Error(
        `Ha ocurrido un error agregando el contenido: ${error.description}`
      );
    }
  }

  async getById(id) {
    try {
      const entries = await this._getEntriesFromFile();
      const searchedEntry = entries.find((e) => e.id === id);
      if (typeof searchedEntry === "undefined") {
        return null;
      }
      return searchedEntry;
    } catch (error) {
      throw error;
    }
  }

  async getAll() {
    try {
      const entries = await this._getEntriesFromFile();
      return entries;
    } catch (error) {
      throw error;
    }
  }

  async update(id, title, price, thumbnail) {
    try {
      const entries = await this._getEntriesFromFile();
      const searchedIndex = entries.findIndex((e) => e.id === id);
      if (searchedIndex === -1) {
        throw new Error(`No existe la entrada con el Id: ${id}`);
      }
      entries[searchedIndex].title = title;
      entries[searchedIndex].price = price;
      entries[searchedIndex].thumbnail = thumbnail;
      await this._saveEntriesToFile(entries);
      return entries[searchedIndex];
    } catch (error) {
      throw error;
    }
  }

  async deleteById(id) {
    try {
      const entries = await this._getEntriesFromFile();
      const filteredEntries = entries.filter((e) => e.id !== id);
      await this._saveEntriesToFile(filteredEntries);
    } catch (error) {
      throw error;
    }
  }

  async deleteAll() {
    try {
      await this._saveEntriesToFile([]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * PRIVATE METHODS.
   */
  async _getEntriesFromFile() {
    try {
      const fileExists = fs.existsSync(this.filePath);
      if (!fileExists) {
        return [];
      }
      const fileContent = await fs.promises.readFile(this.filePath, "utf8");
      const entries = JSON.parse(fileContent);
      return entries;
    } catch (error) {
      throw error;
    }
  }

  async _saveEntriesToFile(entries) {
    try {
      const JSONEntries = JSON.stringify(entries);
      const fileExists = fs.existsSync(this.filePath);
      if (fileExists) {
        await fs.promises.unlink(this.filePath);
      }
      await fs.promises.writeFile(this.filePath, JSONEntries, "utf-8");
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Contenedor;
