const Contenedor = require("./Contenedor");

class APIProductos {
  constructor() {
    this.contenedor = new Contenedor();

    /**
     * Hago el "bind" para que las funciones vean al "this" como este objeto
     * al ser llamadas desde el middleware.
     */
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.add = this.add.bind(this);
    this.update = this.update.bind(this);
    this.deleteById = this.deleteById.bind(this);
  }

  async getAll(req, res, next) {
    try {
      const result = await this.contenedor.getAll();
      res.send({ result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const id = Number.parseInt(req.params.id, 10);
      await this._throwErrorIfNotExists(id);
      const result = await this.contenedor.getById(id);
      res.send({ result });
    } catch (error) {
      next(error);
    }
  }

  async add(req, res, next) {
    try {
      const { title, price, thumbnail } = req.body;
      const result = await this.contenedor.save(title, price, thumbnail);
      res.send({ result });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const id = Number.parseInt(req.params.id, 10);
      await this._throwErrorIfNotExists(id);
      const { title, price, thumbnail } = req.body;
      const result = await this.contenedor.update(id, title, price, thumbnail);
      res.send({ result });
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req, res, next) {
    try {
      const id = Number.parseInt(req.params.id, 10);
      await this._throwErrorIfNotExists(id);
      const result = await this.contenedor.deleteById(id);
      res.send({ result: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PRIVATE METHODS.
   */

  async _throwErrorIfNotExists(id) {
    try {
      const exists = await this.contenedor.exists(id);
      if (!exists) {
        throw new Error("producto no encontrado");
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = APIProductos;
