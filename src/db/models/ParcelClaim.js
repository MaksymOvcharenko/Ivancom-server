import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const ParcelClaim = sequelize.define(
  'parcel_claims',
  {
    full_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    ttn_number: { type: DataTypes.STRING, allowNull: false },
    direction: { type: DataTypes.STRING, allowNull: false },
    parcel_content: { type: DataTypes.TEXT, allowNull: false },
    damage_type: { type: DataTypes.STRING, allowNull: false },
    compensation_type: { type: DataTypes.STRING, allowNull: false },
    problem_description: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  },
);

export default ParcelClaim;
