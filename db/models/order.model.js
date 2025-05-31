const { Model, DataTypes, Sequelize } = require('sequelize');
const { CUSTOMER_TABLE } = require('./customer.model');
// También podrías necesitar importar el modelo Product si aún no lo has hecho
// const { PRODUCT_TABLE } = require('./product.model'); // Solo si vas a usar OrderProduct

const ORDER_TABLE = 'orders';

const OrderSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  customerId: {
    field: 'customer_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: CUSTOMER_TABLE,
      key : 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // Mantengo SET NULL si un Customer puede ser eliminado y la Orden aún exista,
                          // pero si la orden debe eliminarse al borrar el Customer, usa 'CASCADE'.
                          // Revisa tu decisión aquí con tu modelo Customer.
  },
  // --- Nuevos campos sugeridos basados en tu schema Joi ---
  status: {
    allowNull: false, // El estado es esencial
    type: DataTypes.STRING,
    defaultValue: 'pending', // Coincide con tu schema Joi
  },
  orderDate: { // Para cuando necesites una fecha de orden específica, no solo la de creación
    allowNull: false,
    type: DataTypes.DATE,
    field: 'order_date',
    defaultValue: Sequelize.NOW, // Coincide con tu schema Joi
  },
  // --- Fin de nuevos campos ---
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
  total: {
    type: DataTypes.VIRTUAL,
    get() {
        if (this.items.length > 0){
            return this.items.reduce((total,item)=> {
                return total + (item.price * item.OrderProduct.amount)
            }, 0);
        }
        return 0;
    }
  },
};

class Order extends Model {
  static associate(models) {
    this.belongsTo(models.Customer, {
      as: 'customer',
    });
    // Asociación Many-to-Many con Product a través de OrderProduct
    // Necesitas el modelo OrderProduct (o OrderItem) y el modelo Product
    this.belongsToMany(models.Product, {
      as: 'items', // Alias para la relación (ej. order.items)
      through: models.OrderProduct, // La tabla intermedia
      foreignKey: 'order_id', // Foreign key en OrderProduct que apunta a Order
      otherKey: 'product_id', // Foreign key en OrderProduct que apunta a Product
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ORDER_TABLE,
      modelName: 'Order',
      timestamps: false, // Mantenemos false, ya que tienes 'created_at' y 'order_date' manuales
      underscored:true,
    };
  }
}

module.exports = { Order, OrderSchema, ORDER_TABLE };