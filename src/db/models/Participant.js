import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Participant = sequelize.define(
  'participant',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true, // Email має бути унікальним
    },
  },
  {
    timestamps: false, // Нам не потрібні created_at і updated_at
  },
);

export default Participant;
