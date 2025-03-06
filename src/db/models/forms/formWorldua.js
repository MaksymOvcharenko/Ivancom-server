import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../../db.js';

const FormWorldua = sequelize.define(
  'form_worldua',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    agreement: { type: DataTypes.BOOLEAN, allowNull: false },
    promoCode: { type: DataTypes.STRING, field: 'promo_code' },
    currency: { type: DataTypes.STRING, allowNull: false },
    npDepartment: { type: DataTypes.STRING, field: 'np_department' },
    city: { type: DataTypes.STRING, allowNull: false },
    region: { type: DataTypes.STRING, allowNull: false },
    recipientPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'recipient_phone',
    },
    recipientName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'recipient_name',
    },
    recipientSurname: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'recipient_surname',
    },
    orderAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_amount',
    },
    content: { type: DataTypes.STRING },
    sendDate: { type: DataTypes.DATE, allowNull: false, field: 'send_date' },
    carrier: { type: DataTypes.STRING, allowNull: false },
    trackingNumber: { type: DataTypes.STRING, field: 'tracking_number' },
    hidePhone: { type: DataTypes.BOOLEAN, field: 'hide_phone' },
    senderPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'sender_phone',
    },
    senderEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'sender_email',
    },
    senderSurname: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'sender_surname',
    },
    senderName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'sender_name',
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
    timestamps: false, // Якщо не треба автоматичних createdAt/updatedAt
  },
);

export default FormWorldua;
