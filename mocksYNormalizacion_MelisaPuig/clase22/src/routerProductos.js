const express = require("express");

const APIProductos = require("./ApiProductos");
const apiProductos = new APIProductos();
const routerProductos = express.Router();

routerProductos.use(express.json());

routerProductos.get("/", apiProductos.getAll);
routerProductos.get("/:id", apiProductos.getById);
routerProductos.post("/", apiProductos.add);
routerProductos.put("/:id", apiProductos.update);
routerProductos.delete("/:id", apiProductos.deleteById);

routerProductos.all("*", (req, res, next) => {
  const notFoundMethodError = new Error(`${req.url} no es una API válida.`);
  next(notFoundMethodError);
});

routerProductos.use((error, req, res, next) => {
  console.error(error);
  res.send({ error: error.message });
});

module.exports = routerProductos;
