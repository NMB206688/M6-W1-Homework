const mongoose = require('mongoose');

// Use a flexible schema so it matches your inventories.json without guessing fields.
const InventorySchema = new mongoose.Schema(
  {},
  { strict: false, collection: 'inventories', timestamps: true }
);

module.exports = mongoose.model('Inventory', InventorySchema);
