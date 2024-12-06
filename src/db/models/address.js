import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
// import Shipment from './shipments.js';


const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Назва таблиці користувачів
      key: 'id',      // Поле, на яке посилаємося
    },
    onDelete: 'CASCADE',
  },
  parcel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'parcels', // Назва таблиці посилок
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  address_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['sender', 'recipient']], // Допустимі значення
    },
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  street: {
    type: DataTypes.STRING(255),

  },
  building_number: {
    type: DataTypes.STRING(50),
  },
  apartment_number: {
    type: DataTypes.STRING(50),
  },
  floor_number: {
    type: DataTypes.STRING(50),
  },
  postal_code: {
    type: DataTypes.STRING(20),
  },
  np_branch: {
    type: DataTypes.STRING(200),
  },
  np_branch_ref: {
    type: DataTypes.STRING(50),
  },
  np_street_ref: {
    type: DataTypes.STRING(50),
  },
  np_city_ref: {
    type: DataTypes.STRING(50),
  },
  delivery_method: {
    type: DataTypes.STRING(50),

    validate: {
      isIn: [['department', 'address']], // Допустимі типи доставки
    },
  },
  inpost_branch_number: {
    type: DataTypes.STRING(50),
  },
  inpost_street_ref: {
    type: DataTypes.STRING(100),
  },
  np_tracking_number: {
    type: DataTypes.STRING(50),
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
  tableName: 'addresses', // Назва таблиці
  timestamps: false,      // Відключення авто-полів `createdAt` і `updatedAt`
});
// Address.hasMany(Shipment, { as: 'senderShipments', foreignKey: 'sender_address_id' });
// Address.hasMany(Shipment, { as: 'recipientShipments', foreignKey: 'recipient_address_id' });


export default Address;
