const fs = require("fs");
const normalizr = require("normalizr");
const path = require("path");

const BASE_FILE_PATH = path.join(__dirname, "chats.txt");
const CHATS_MAX_MESSAGES = 1000;

const authorSchema = new normalizr.schema.Entity("autores", undefined, {
  idAttribute: "email",
});
const messageSchema = new normalizr.schema.Entity("mensajes", {
  author: authorSchema,
});
const chatSchema = new normalizr.schema.Entity("chat", {
  mensajes: [messageSchema],
});

class Chat {
  constructor() {
    this.filePath = BASE_FILE_PATH;
  }

  async getAll() {
    try {
      const chats = await this._getChatsFromFile();
      return chats;
    } catch (error) {
      throw error;
    }
  }

  async getAllNormalized() {
    try {
      const mensajes = await this._getChatsFromFile();
      const chat = { id: "chat", mensajes };
      const normalizedChats = normalizr.normalize(chat, chatSchema);
      const originalLength = JSON.stringify(mensajes).length;
      const normalizedLength = JSON.stringify(normalizedChats).length;
      const normalizationCompression = normalizedLength / originalLength;
      return { normalizedChats, normalizationCompression };
    } catch (error) {
      throw error;
    }
  }

  async addMessage(author, text) {
    try {
      this._validateAuthor(author);
      const date = new Date();
      const newMessage = { author, text, date };
      let chats = await this._getChatsFromFile();
      let nextId = 1;
      if (chats.length > 0) {
        const ids = chats.map((e) => Number.parseInt(e.id));
        nextId = Math.max(...ids) + 1;
      }
      newMessage.id = nextId.toString();
      chats.push(newMessage);
      if (chats.length > CHATS_MAX_MESSAGES) {
        chats = chats.slice(-CHATS_MAX_MESSAGES);
      }
      await this._saveChatsToFile(chats);
      return newMessage;
    } catch (error) {
      throw new Error(
        `Ha ocurrido un error agregando el contenido: ${error.message}`
      );
    }
  }

  /**
   * PRIVATE METHODS.
   */

  async _getChatsFromFile() {
    try {
      const fileExists = fs.existsSync(this.filePath);
      if (!fileExists) {
        return [];
      }
      const fileContent = await fs.promises.readFile(this.filePath, "utf8");
      const chats = JSON.parse(fileContent);
      return chats;
    } catch (error) {
      throw error;
    }
  }

  async _saveChatsToFile(chats) {
    try {
      const JSONChats = JSON.stringify(chats);
      const fileExists = fs.existsSync(this.filePath);
      if (fileExists) {
        await fs.promises.unlink(this.filePath);
      }
      await fs.promises.writeFile(this.filePath, JSONChats, "utf-8");
    } catch (error) {
      throw error;
    }
  }

  _validateAuthor(author) {
    const requiredProps = [
      "email",
      "nombre",
      "apellido",
      "edad",
      "alias",
      "avatar",
    ];
    requiredProps.forEach((prop) => {
      if (typeof author[prop] === "undefined") {
        throw new Error(`El autor debe tener la propiedad ${prop}`);
      }
    });
  }
}

module.exports = Chat;
