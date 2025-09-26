import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Payment1C from "./Payment1C.js";

const Payment1CEvent = sequelize.define("Payment1CEvent", {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

  payment_id: { type: DataTypes.UUID, allowNull: false },

  event_type: { type: DataTypes.STRING, allowNull: false }, // created, email_sent, webhook_received, status_changed, error
  event_payload: { type: DataTypes.JSONB },

  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "payment_1c_events",
  underscored: true,
  timestamps: false
});

// Асоціації
Payment1CEvent.belongsTo(Payment1C, { foreignKey: "payment_id" });
Payment1C.hasMany(Payment1CEvent, { foreignKey: "payment_id" });

export default Payment1CEvent;
