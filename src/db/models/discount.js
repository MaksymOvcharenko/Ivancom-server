import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../db.js';

const Discount = sequelize.define(
  'discount',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    percentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remaining: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    timestamps: false,
  },
);

export default Discount;
