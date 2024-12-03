import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
// import Shipment from './shipments.js';


const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  shipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shipment', // Назва таблиці
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  amount: {
    type: DataTypes.NUMERIC,
    allowNull: false,
  },
  redirect_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  confirmation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
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
  tableName: 'payments',
  timestamps: false,
});
// Payment.hasOne(Shipment, { foreignKey: 'payment_id' });

export default Payment;
