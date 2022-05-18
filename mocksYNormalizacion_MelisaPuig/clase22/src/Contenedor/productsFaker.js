const faker = require("faker");

class ProductsFaker {
  generateProducts(count) {
    const finalProducts = [];
    for (let i = 0; i < count; i++) {
      const newProduct = {
        nombre: faker.commerce.productName(),
        precio: faker.datatype.float({ min: 1, max: 300, precision: 0.01 }),
        foto: faker.image.business(),
      };
      finalProducts.push(newProduct);
    }
    return finalProducts;
  }
}

module.exports = new ProductsFaker();
