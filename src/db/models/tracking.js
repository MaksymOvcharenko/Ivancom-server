// models/Tracking.ts
import { DataTypes } from 'sequelize';
import { sequelizeTracking } from '../db.js';

export const Tracking = sequelizeTracking.define(
  'ttnout',
  {
    TTN: {
      type: DataTypes.DECIMAL(20, 0),
      allowNull: false,
      primaryKey: true, // <--- добавляем как первичный ключ
    },
    Status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    Numberdoc: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    Comment: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    DateYear: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DateDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DateMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    Division: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    DivisionTo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    Direction: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    CarrierTracker: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    Carrier: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    CarrierTrackerNom: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    Country: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    Address: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
  },
  {
    tableName: 'ttnout', // строго как в базе
    timestamps: false, // чтобы sequelize не искал updatedAt
  },
);
