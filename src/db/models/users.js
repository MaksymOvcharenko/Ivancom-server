import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../db.js';
// import Shipment from './shipments.js';
  // Підключення до бази даних

  const User = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,  // База буде автоматично генерувати значення
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    middle_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    ref_code_np: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ref_code_np_contactPerson: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  }, {
    timestamps: false,
  },
  // {
  //   tableName: 'users'  // явно вказуємо ім'я таблиці
  // }
);
// User.hasMany(Shipment, { as: 'sentShipments', foreignKey: 'sender_id' });
// User.hasMany(Shipment, { as: 'receivedShipments', foreignKey: 'recipient_id' });


  export default User;
