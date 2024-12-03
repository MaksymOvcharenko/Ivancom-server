import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
// import User from './users.js';
// import Address from './address.js';
// import Parcel from './parcels.js';
// import Payment from './payments.js';


const Shipment = sequelize.define('Shipment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Назва таблиці користувачів
      key: 'id',
    },
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  sender_address_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'addresses', // Назва таблиці адрес
      key: 'id',
    },
  },
  recipient_address_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'addresses',
      key: 'id',
    },
  },
  parcel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'parcels', // Назва таблиці посилок
      key: 'id',
    },
  },
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'payments', // Назва таблиці платежів
      key: 'id',
    },
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
  tableName: 'shipment',
  timestamps: false,
});
// Shipment.belongsTo(User, { as: 'sender', foreignKey: 'sender_id' });
// Shipment.belongsTo(User, { as: 'recipient', foreignKey: 'recipient_id' });
// Shipment.belongsTo(Address, { as: 'senderAddress', foreignKey: 'sender_address_id' });
// Shipment.belongsTo(Address, { as: 'recipientAddress', foreignKey: 'recipient_address_id' });
// Shipment.belongsTo(Parcel, { foreignKey: 'parcel_id' });
// Shipment.belongsTo(Payment, { foreignKey: 'payment_id' });

export default Shipment;
