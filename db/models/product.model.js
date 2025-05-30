const { Model, DataTypes, Sequelize } = require('sequelize');
const { CATEGORY_TABLE } = require('./category.model');
const PRODUCT_TABLE = 'products'; // Nombre de la tabla en la base de datos

const ProductSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: false, // El nombre del producto podría ser único
  },
  description: {
    allowNull: true, // Puede ser nulo si es una descripción corta o no necesaria al inicio
    type: DataTypes.TEXT, // Usar TEXT para descripciones largas
  },
  price: {
    allowNull: false,
    type: DataTypes.DECIMAL(10, 2), // DECIMAL para precios (total de 10 dígitos, 2 después del punto decimal)
  },
  stock: {
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 0, // Por defecto, el stock inicial es 0
  },
  imageUrl: {
    allowNull: true, // La imagen puede ser opcional
    type: DataTypes.STRING, // Almacenar la URL de la imagen
    field: 'image_url', // Nombre de la columna en la DB si es diferente al camelCase
  },
  categoryId: { // Foreign key para relacionar con una tabla de categorías
    allowNull: true, // Puede ser nulo si un producto no tiene categoría asignada
    type: DataTypes.INTEGER,
    field: 'category_id', // Nombre de la columna en la DB
    // Referencia a otra tabla (si tienes una tabla de categorías)
    // references: {
    model: CATEGORY_TABLE, // Nombre de la tabla de categorías
    //   key: 'id',
    // },
    // onDelete: 'SET NULL', // Qué hacer si la categoría es eliminada (SET NULL, CASCADE, RESTRICT)
  },
  isBlock: { // Para habilitar/deshabilitar un producto fácilmente
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_block',
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'create_at', // Nombre de la columna en la DB (snake_case)
    defaultValue: Sequelize.NOW,
  },
  updatedAt: { // Opcional: para registrar la última actualización
    allowNull: true,
    type: DataTypes.DATE,
    field: 'update_at',
    defaultValue: Sequelize.NOW,
  }
};

class Product extends Model {
  static associate(models) {
    // Definir asociaciones aquí (ej: Product.belongsTo(models.Category))
    // Si tienes un modelo Category, descomenta y usa esta asociación:
     this.belongsTo(models.Category, { as: 'category', foreignKey: 'category_id' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PRODUCT_TABLE,
      modelName: 'Product',
      timestamps: false,
       // O true si prefieres que Sequelize maneje createdAt y updatedAt automáticamente
                        // Si pones true, no necesitas `field: 'create_at'` y `field: 'update_at'`
                        // Sequelize buscaría `createdAt` y `updatedAt` por defecto
                        // Pero si quieres snake_case (create_at, update_at), entonces 'timestamps: true' y 'underscored: true'
                        // O 'timestamps: false' y manejas 'create_at', 'update_at' manualmente como lo tienes
    };
  }
}

module.exports = { PRODUCT_TABLE, ProductSchema, Product };