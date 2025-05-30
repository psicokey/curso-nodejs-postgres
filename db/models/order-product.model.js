const { Model, DataTypes, Sequelize } = require('sequelize');
const { ORDER_TABLE } = require('./order.model');
const { PRODUCT_TABLE } = require('./product.model'); // Asegúrate de que esta ruta sea correcta

const ORDER_PRODUCT_TABLE = 'orders_products'; // Nombre de la tabla intermedia

const OrderProductSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  amount: { // Cantidad del producto en la orden
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  price: { // Precio al que se vendió el producto en ESTA orden (importante para historial)
    allowNull: false,
    type: DataTypes.DECIMAL(10, 2), // Usar DECIMAL para precios
  },
  orderId: { // Clave foránea que referencia a la tabla 'orders'
    field: 'order_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: ORDER_TABLE, // Nombre de la tabla de órdenes
      key: 'id',
    },
    onUpdate: 'CASCADE', // Si el ID de la orden cambia, actualiza aquí
    onDelete: 'CASCADE', // Si la orden se elimina, elimina este ítem de la orden
  },
  productId: { // Clave foránea que referencia a la tabla 'products'
    field: 'product_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: PRODUCT_TABLE, // Nombre de la tabla de productos
      key: 'id',
    },
    onUpdate: 'CASCADE', // Si el ID del producto cambia, actualiza aquí
    onDelete: 'RESTRICT', // O 'RESTRICT'. Si un producto se elimina, puedes dejar el ítem en la orden y el productId como NULL.
                          // 'CASCADE' borraría el item de la orden si el producto se borra (menos común).
                          // 'SET NULL' requiere que la columna product_id sea allowNull: true,
                          // si quieres 'RESTRICT' o 'NO ACTION', entonces allowNull: false es ok.
                          // Para mantener historial de precios, 'SET NULL' o 'RESTRICT' son mejores.
  },
  createdAt: { // Fecha de creación de este registro OrderProduct
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
};

class OrderProduct extends Model {
  static associate(models) {
    // Estas asociaciones son importantes para poder acceder a la orden y el producto desde un OrderProduct.
    this.belongsTo(models.Order, { as: 'order' });
    this.belongsTo(models.Product, { as: 'product' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ORDER_PRODUCT_TABLE,
      modelName: 'OrderProduct',
      timestamps: false, // Mantenemos false porque gestionamos 'created_at' manualmente
      underscored:true
    };
  }
}

module.exports = { OrderProduct, OrderProductSchema, ORDER_PRODUCT_TABLE };