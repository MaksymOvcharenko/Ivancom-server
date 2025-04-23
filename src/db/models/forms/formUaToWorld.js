import { DataTypes } from 'sequelize';
import { sequelizeDB1C } from '../../db.js';

const UaToWorld = sequelizeDB1C.define(
  'Address',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ttn: {
      type: DataTypes.STRING(19),
      allowNull: false,
    },
    senderFirstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    senderLastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    senderPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    senderEmail: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    recipientFirstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    recipientLastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    recipientPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    recipientEmail: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    deliveryOption: {
      type: DataTypes.ENUM('branch', 'ivancom-courier', 'inpost', 'dhl'),
      allowNull: false,
    },
    branch: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    inpost_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    locality: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    administrativeAreaLevel1: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    apart: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    parcelDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    payer: {
      type: DataTypes.ENUM('recipient', 'sender'),
      allowNull: false,
    },
    promoCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    rateFromPLNtoUAH: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    dataConsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    holod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // або 1, якщо за замовчуванням включено
      validate: {
        isIn: [[0, 1]], // дозволяє тільки 0 або 1
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'addresses',
    timestamps: false,
  },
);

export default UaToWorld;
