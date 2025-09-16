// // models/BusinessOrder.js
// import { DataTypes, Model } from 'sequelize';
// import sequelize from '../../db.js';

// class BusinessOrder extends Model {}

// BusinessOrder.init(
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },

//     business_id: {
//       type: DataTypes.UUID,
//       allowNull: false,
//     },

//     order_number: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     batch_number: {
//       type: DataTypes.STRING,
//     },

//     // --- Sender ---
//     sender_client_id: { type: DataTypes.STRING, allowNull: false },
//     sender_promo_code: { type: DataTypes.STRING },
//     sender_payer: { type: DataTypes.STRING, defaultValue: 'sender' },
//     sender_name: { type: DataTypes.STRING },
//     sender_surname: { type: DataTypes.STRING },
//     sender_phone: { type: DataTypes.STRING },
//     sender_email: { type: DataTypes.STRING },

//     // --- Receiver ---
//     receiver_type: {
//       type: DataTypes.ENUM('person', 'company'),
//       defaultValue: 'person',
//     },
//     receiver_firstname: { type: DataTypes.STRING },
//     receiver_lastname: { type: DataTypes.STRING },
//     receiver_phone: { type: DataTypes.STRING },
//     receiver_email: { type: DataTypes.STRING },
//     receiver_company: { type: DataTypes.STRING },

//     // --- Address ---
//     address_country: { type: DataTypes.STRING },
//     address_country_code: { type: DataTypes.STRING(5) },
//     address_city: { type: DataTypes.STRING },
//     address_region: { type: DataTypes.STRING },
//     address_street: { type: DataTypes.STRING },
//     address_postal_code: { type: DataTypes.STRING },
//     address_house_number: { type: DataTypes.STRING },
//     address_apartment: { type: DataTypes.STRING },

//     // --- Delivery ---
//     delivery_method: {
//       type: DataTypes.ENUM(
//         'ivancom_branch',
//         'inpost_paczkomat',
//         'inpost_courier',
//         'dhl_courier',
//       ),
//       allowNull: false,
//     },
//     paczkomat_code: { type: DataTypes.STRING },

//     weight_class: { type: DataTypes.SMALLINT }, // 1 або 3
//     dim_length_cm: { type: DataTypes.DECIMAL(6, 2), defaultValue: 15 },
//     dim_width_cm: { type: DataTypes.DECIMAL(6, 2), defaultValue: 15 },
//     dim_height_cm: { type: DataTypes.DECIMAL(6, 2), defaultValue: 10 },
//     declared_value: { type: DataTypes.DECIMAL(12, 2) },

//     // --- Cost ---
//     shipping_route: { type: DataTypes.STRING },
//     shipping_cost: { type: DataTypes.DECIMAL(12, 2) },
//     box_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 2.0 },
//     insurance_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
//     currency: { type: DataTypes.STRING, defaultValue: 'PLN' },

//     total_cost: {
//       type: DataTypes.DECIMAL(12, 2),
//       // можна вираховувати на бекенді перед save
//     },

//     // --- Tracking ---
//     tracking_inpost: { type: DataTypes.STRING },
//     tracking_dhl: { type: DataTypes.STRING },

//     // --- Meta / status ---
//     status: {
//       type: DataTypes.ENUM('draft', 'processing', 'shipped', 'delivered'),
//       defaultValue: 'draft',
//     },
//     meta: { type: DataTypes.JSONB },

//     created_at: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//     updated_at: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//   },
//   {
//     sequelize,
//     modelName: 'BusinessOrder',
//     tableName: 'business_orders',
//     underscored: true,
//     timestamps: false, // ми явно контролюємо created_at / updated_at
//   },
// );

// export default BusinessOrder;
// models/BusinessOrder.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../db.js';

class BusinessOrder extends Model {}

BusinessOrder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    business_id: { type: DataTypes.UUID, allowNull: false },

    order_number: { type: DataTypes.TEXT, allowNull: false },
    batch_number: { type: DataTypes.TEXT },

    // --- Sender ---
    sender_client_id: { type: DataTypes.TEXT, allowNull: false },
    sender_promo_code: { type: DataTypes.TEXT },
    sender_payer: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'sender',
    },
    sender_name: { type: DataTypes.TEXT },
    sender_surname: { type: DataTypes.TEXT },
    sender_phone: { type: DataTypes.TEXT },
    sender_email: { type: DataTypes.TEXT },

    // --- Receiver ---
    receiver_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'person',
    },
    receiver_firstname: { type: DataTypes.TEXT },
    receiver_lastname: { type: DataTypes.TEXT },
    receiver_phone: { type: DataTypes.TEXT },
    receiver_email: { type: DataTypes.TEXT },
    receiver_company: { type: DataTypes.TEXT },

    // --- Address ---
    address_country: { type: DataTypes.TEXT },
    address_country_code: { type: DataTypes.TEXT },
    address_city: { type: DataTypes.TEXT },
    address_region: { type: DataTypes.TEXT },
    address_street: { type: DataTypes.TEXT },
    address_postal_code: { type: DataTypes.TEXT },
    address_house_number: { type: DataTypes.TEXT },
    address_apartment: { type: DataTypes.TEXT },

    // --- Delivery ---
    delivery_method: { type: DataTypes.STRING, allowNull: false },
    paczkomat_code: { type: DataTypes.TEXT },

    // --- Shipment ---
    weight_class: { type: DataTypes.SMALLINT }, // 1 | 3
    dim_length_cm: { type: DataTypes.DECIMAL, defaultValue: 15 },
    dim_width_cm: { type: DataTypes.DECIMAL, defaultValue: 15 },
    dim_height_cm: { type: DataTypes.DECIMAL, defaultValue: 10 },
    declared_value: { type: DataTypes.DECIMAL },

    // --- Costs ---
    shipping_route: { type: DataTypes.TEXT },
    shipping_cost: { type: DataTypes.DECIMAL },
    box_cost: { type: DataTypes.DECIMAL, allowNull: false, defaultValue: 2.0 },
    insurance_cost: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0.0,
    },
    currency: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'PLN' },
    total_cost: { type: DataTypes.DECIMAL },

    // --- Tracking ---
    inpost_shipment_id: { type: DataTypes.TEXT },
    tracking_inpost: { type: DataTypes.TEXT },
    tracking_dhl: { type: DataTypes.TEXT },

    // --- Meta/Status ---
    status: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'draft' },
    meta: { type: DataTypes.JSONB },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'BusinessOrder',
    tableName: 'business_orders', // 👈 EXACT!
    underscored: true,
    timestamps: false,
  },
);

export default BusinessOrder;
