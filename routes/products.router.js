const express = require('express');

const ProductsService = require('./../services/product.service');
const validatorHandler = require('./../middlewares/validator.handler'); // Asegúrate que este archivo tenga la línea req[property] = value;
const {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  queryProductSchema
} = require('./../schemas/product.schema');

const router = express.Router();
const service = new ProductsService();

// --- Rutas GET ---

// 1. Ruta para obtener TODOS los productos (con opciones de paginación y filtrado)
// Esta debe ir PRIMERO para evitar conflictos con /:id
router.get('/',
  validatorHandler(queryProductSchema, 'query'), // Valida y transforma los query params (limit, offset)
  async (req, res, next) => {
    try {
      // req.query ya contendrá 'limit' y 'offset' como números (o undefined)
      // gracias al validatorHandler y queryProductSchema
      const products = await service.find(req.query);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }
);

// 2. Ruta para obtener un producto por ID (más específica)
// Esta debe ir DESPUÉS de la ruta general GET /
router.get('/:id',
  validatorHandler(getProductSchema, 'params'), // Valida que 'id' en los parámetros de la URL sea un número
  async (req, res, next) => {
    try {
      // req.params.id ya será un número entero gracias al validatorHandler
      const { id } = req.params;
      const product = await service.findOne(id);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);


// --- Rutas de Modificación (POST, PATCH, DELETE) ---

// 3. Ruta para CREAR un nuevo producto
router.post('/',
  validatorHandler(createProductSchema, 'body'), // Valida el cuerpo de la petición
  async (req, res, next) => {
    try {
      const body = req.body; // req.body ya estará validado y limpio
      const newProduct = await service.create(body);
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  }
);

// 4. Ruta para ACTUALIZAR un producto por ID
router.patch('/:id',
  validatorHandler(getProductSchema, 'params'), // Primero valida el 'id' de la URL
  validatorHandler(updateProductSchema, 'body'), // Luego valida el cuerpo de la petición
  async (req, res, next) => {
    try {
      const { id } = req.params; // 'id' ya será un número
      const body = req.body;     // 'body' ya estará validado
      const product = await service.update(id, body);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);

// 5. Ruta para ELIMINAR un producto por ID
router.delete('/:id',
  validatorHandler(getProductSchema, 'params'), // Valida el 'id' de la URL
  async (req, res, next) => {
    try {
      const { id } = req.params; // 'id' ya será un número
      await service.delete(id);
      res.status(200).json({ id, message: 'Producto eliminado exitosamente' }); // Mensaje de éxito claro
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;