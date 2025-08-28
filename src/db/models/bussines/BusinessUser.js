// models/BusinessUser.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../db.js';

class BusinessUser extends Model {}

BusinessUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user',
    },
    business_client_id: {
      type: DataTypes.UUID,
      allowNull: true, // admin = null, user = конкретний business_client
      references: {
        model: 'business_client',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'BusinessUser',
    tableName: 'business_user',
    underscored: true,
    timestamps: false,
  },
);

export default BusinessUser;
