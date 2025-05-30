const Joi = require('joi');

const customerId = Joi.number().integer().positive().required();
const id = Joi.number().integer().positive(); // 'id' para uso general, no para ítems al crear orden
const productId = Joi.number().integer().positive().required();
const quantity = Joi.number().integer().min(1).required();
const price = Joi.number().precision(2).positive().required();

const getOrderSchema = Joi.object({
    id: id.required(),
});

const createOrderSchema = Joi.object({
    customerId: customerId, // Para crear una orden básica sin ítems iniciales
});

// Esquema para items de la orden (para OrderProduct) cuando se añaden a una ORDEN EXISTENTE
const orderItemSchema = Joi.object({
    orderId: id.required(), // Aquí SÍ se requiere el orderId, porque la orden ya existe
    productId: productId,
    quantity: quantity,
    price: price,
});

// Esquema para la creación de una orden COMPLETA (incluyendo ítems)
const orderDetailSchema = Joi.object({
    customerId: customerId.required(),
    items: Joi.array()
      .items(Joi.object({ // Define el objeto de cada ítem aquí mismo para claridad
        productId: productId.required(),
        quantity: quantity.required(),
        price: price.required(),
        // !!! ELIMINA 'orderId' DE AQUÍ AL CREAR UNA NUEVA ORDEN !!!
        // orderId: id.required(), // <--- ¡BORRA ESTA LÍNEA!
      }))
      .min(1)
      .required(), // Los ítems son requeridos para esta creación detallada
    status: Joi.string()
      .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
      .default('pending'),
    orderDate: Joi.date()
      .default(Date.now)
});

const updateOrderSchema = Joi.object({
    status: Joi.string()
      .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
      .required(),
});

module.exports = {
  getOrderSchema,
  createOrderSchema,
  orderDetailSchema,
  updateOrderSchema,
  orderItemSchema
};