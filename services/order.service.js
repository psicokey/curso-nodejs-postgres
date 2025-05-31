const boom = require('@hapi/boom');
const { models } = require('./../libs/sequelize');

class OrderService {
  constructor() {}

  async create(data) {
    // 'data' viene de orderDetailSchema (customerId, items, status, orderDate)
    const orderData = {
      customerId: data.customerId,
      status: data.status || 'pending',
      orderDate: data.orderDate || new Date(),
    };

    // 1. Crear la cabecera de la orden
    const newOrder = await models.Order.create(orderData);

    // 2. Si hay ítems, crearlos en la tabla intermedia OrderProduct
    if (data.items && data.items.length > 0) {
      const orderProducts = data.items.map(item => ({
        ...item,
        amount: item.quantity, // Mapear 'quantity' de Joi a 'amount' del modelo
        orderId: newOrder.id,
      }));
      await models.OrderProduct.bulkCreate(orderProducts);
    }

    // 3. Obtener la orden completa con sus relaciones para la respuesta
    const orderWithDetails = await this.findOne(newOrder.id);
    return orderWithDetails;
  }

  async addItem(data) {
    // 'data' debe contener orderId, productId, quantity, price
    // Mapear 'quantity' a 'amount' si es necesario para el modelo
    const itemData = {
      orderId: data.orderId,
      productId: data.productId,
      amount: data.quantity, // Asegúrate de que el modelo OrderProduct use 'amount'
      price: data.price,
    };
    const newItem = await models.OrderProduct.create(itemData);
    return newItem;
  }

  async find() {
    const rta = await models.Order.findAll({
      include: [
        {
          association: 'customer',
          include: [
            {
              association: 'user',
              attributes: { exclude: ['password'] } // <-- Añade esto de vuelta aquí
            }
          ]
        },
        {
          association: 'items',
          through: {
            attributes: ['amount', 'price'],
          },
        }
      ],
    });
    return rta;
  }

  async findOne(id) {
    const order = await models.Order.findByPk(id, {
      include: [
        {
          association: 'customer',
          include: [
            {
              association: 'user',
              attributes: { exclude: ['password'] } // <-- Añade esto de vuelta aquí
            },
          ],
        },
        {
          association: 'items',
          through: {
            attributes: ['amount', 'price'],
          },
        }
      ],
    });

    if (!order) {
      throw boom.notFound('Orden no encontrada');
    }
    return order;
  }

  async update(id, changes) {
    const order = await this.findOne(id);
    const rta = await order.update(changes);
    return rta;
  }

  async delete(id) {
    const order = await this.findOne(id);
    await order.destroy();
    return { id, message: 'Orden eliminada exitosamente' };
  }
}

module.exports = OrderService;