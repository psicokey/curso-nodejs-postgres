const express = require('express');

const OrderService = require('../services/order.service');
const validatorHandler = require('../middlewares/validator.handler');

const {
  getOrderSchema,
  createOrderSchema, // Para crear una orden simple (solo customerId)
  orderDetailSchema, // Para crear una orden completa con ítems y estado
  updateOrderSchema,
  orderItemSchema, // Para agregar ítems individualmente a una orden existente
} = require('../schemas/order.schema');

const router = express.Router();
const service = new OrderService();

// --- Rutas CRUD para la gestión de Órdenes ---

// Obtener todas las órdenes
router.get('/',
  async (req, res, next) => {
    try {
      const orders = await service.find();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }
);

// Obtener una orden por ID
router.get('/:id',
  validatorHandler(getOrderSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const order = await service.findOne(id);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }
);

// Crear una nueva orden (completa con ítems)
router.post('/',
  validatorHandler(orderDetailSchema, 'body'), // Usamos orderDetailSchema para crear la orden completa
  async (req, res, next) => {
    try {
      const body = req.body;
      const newOrder = await service.create(body);
      res.status(201).json(newOrder);
    } catch (error) {
      next(error);
    }
  }
);

// Actualizar una orden (ej. cambiar su estado)
router.patch('/:id',
  validatorHandler(getOrderSchema, 'params'),
  validatorHandler(updateOrderSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedOrder = await service.update(id, body);
      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  }
);

// Eliminar una orden
router.delete('/:id',
  validatorHandler(getOrderSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await service.delete(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// --- Ruta para agregar un producto a una orden existente ---
router.post('/add-item',
  validatorHandler(orderItemSchema, 'body'), // Valida que el body tenga orderId, productId, quantity, price
  async (req, res, next) => {
    try {
      const body = req.body; // El body debe contener { orderId, productId, quantity, price }
      const newItem = await service.addItem(body);
      res.status(201).json(newItem);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;