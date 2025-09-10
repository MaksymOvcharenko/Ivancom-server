// models/promo_code_usage.js
import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../db.js';

const PromoCodeUsage = sequelize.define(
  'promo_code_usage',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    code_norm: { type: DataTypes.STRING(64), allowNull: false },
    used_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  {
    timestamps: false,
    indexes: [
      { name: 'idx_code', fields: ['code_norm'] },
      {
        name: 'uniq_user_code',
        unique: true,
        fields: ['user_id', 'code_norm'],
      },
    ],
  },
);

export default PromoCodeUsage;
