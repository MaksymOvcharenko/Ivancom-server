// models/BusinessClient.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../db.js';

class BusinessClient extends Model {}

BusinessClient.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'archived'),
      allowNull: false,
      defaultValue: 'active',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // або залиш як дефолт у БД
    },
  },
  {
    sequelize,
    modelName: 'BusinessClient',
    tableName: 'business_client',
    underscored: true,
    timestamps: false, // у нас лише created_at; якщо потрібен updated_at — ввімкни timestamps і map полям
  },
);

export default BusinessClient;
