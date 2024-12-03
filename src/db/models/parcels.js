import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Parcel = sequelize.define('Parcel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Поле обов'язкове
    references: {
      model: 'users', // Назва таблиці користувачів
      key: 'id',      // Поле зв'язку
    },
  },
  crate_name: {
    type: DataTypes.STRING(1),
    allowNull: false,
    validate: {
      isIn: [['A', 'B', 'C']], // Перевірка на одне з трьох значень
    },
  },
  length: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  width: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  height: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  weight_actual: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  weight_dimensional: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  estimated_value: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  description: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'parcels', // Назва таблиці
  timestamps: false,    // Відключення автоматичних полів `createdAt` і `updatedAt`
});

export default Parcel;
