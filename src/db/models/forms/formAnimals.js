import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../../db.js'; // ваш файл підключення до БД

const Animals = sequelize.define(
  'animals',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    poroda: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weightAnimals: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'weightanimals',
    },
    typeAnimals: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'typeanimals',
    },
    agreement: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    for: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sendDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'senddate',
    },
    hidePhone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'hidephone',
    },
    senderPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'senderphone',
    },
    senderEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'senderemail',
    },
    senderSurname: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'sendersurname',
    },
    senderName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'sendername',
    },
    fileLinks: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      field: 'filelinks',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      field: 'createdat',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      field: 'updatedat',
    },
  },
  {
    timestamps: false, // Увімкнути, якщо хочете використовувати timestamps
  },
);

export default Animals;
