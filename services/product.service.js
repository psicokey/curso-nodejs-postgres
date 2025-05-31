const { faker } = require('@faker-js/faker');
const boom = require('@hapi/boom');

const { models } = require ('../libs/sequelize')

class ProductsService {

  constructor(){
    this.products = [];
    this.generate();
  }

  generate() {
    const limit = 100;
    for (let index = 0; index < limit; index++) {
      this.products.push({
        id: faker.datatype.uuid(),
        name: faker.commerce.productName(),
        price: parseInt(faker.commerce.price(), 10),
        image: faker.image.imageUrl(),
        isBlock: faker.datatype.boolean(),
      });
    }
  }

  async create(data) {
    const newProduct = await models.Product.create(data);
    return newProduct;
  }

 async find(query) {
  const options ={
    include: ['category'],
  }
  const {limit, offset} = query;
  if (limit && offset) {
    options.limit = limit;
    options.offset = offset;
  }
  const products = await models.Product.findAll(options);
    return products;
  }

  async findOne(id) {
    const product = await models.Product.findByPk(id, {
      include: ['category'] // Incluye la categoría asociada si la tienes
    });
    if (!product) {
      throw boom.notFound('product not found');
    }
    if (product.isBlock) {
      throw boom.conflict('product is block');
    }

    return product;
  }

  async update(id, changes) {
    const product = await this.findOne(id); // Reutiliza findOne para obtener el producto de la DB
    const rta = await product.update(changes);
    return rta;
  }

  async delete(id) {
    const product = await this.findOne(id); // Reutiliza findOne
    await product.destroy();
    return { id, message: 'Product deleted successfully' };
  }
}


module.exports = ProductsService;
