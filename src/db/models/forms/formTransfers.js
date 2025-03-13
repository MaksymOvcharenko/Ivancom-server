import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../../db.js';

const Transfers = sequelize.define(
  'transfers',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    senderName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'sender_name',
    },
    senderSurname: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'sender_surname',
    },
    senderEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'sender_email',
    },
    senderPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'sender_phone',
    },
    hidePhone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'hide_phone',
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'from',
    },
    for: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'for',
    },
    agreement: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    sendDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'send_date',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      field: 'updated_at',
    },
  },
  {
    timestamps: false,
  },
);

export default Transfers;
