import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Payment1C = sequelize.define("Payment1C", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },

  act_number: { type: DataTypes.TEXT, allowNull: false, unique: true },

  amount_uah: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  amount_pln: { type: DataTypes.DECIMAL(12,2), allowNull: false },

  pay_method: { type: DataTypes.STRING, allowNull: false }, // 'mono' | 'p24'

  email: { type: DataTypes.TEXT },
  phone: { type: DataTypes.TEXT },
  email_text: { type: DataTypes.TEXT },
  np_ttn: { type: DataTypes.TEXT },

  link_token: { type: DataTypes.TEXT, allowNull: false, unique: true },
  payment_url: { type: DataTypes.TEXT },
  gateway_order_id: { type: DataTypes.TEXT },

  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "pending",
    validate: {
      isIn: [["pending","link_sent","processing","paid","failed","expired","canceled"]]
    }
  },

  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "payment_1c",
  underscored: true,
  timestamps: false // у таблиці вже є created_at/updated_at
});

export default Payment1C;
