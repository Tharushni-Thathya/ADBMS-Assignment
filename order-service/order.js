const { Schema, model } = require("mongoose");

const OrderSchema = new Schema({
  userId: {
    type: Number,
    required: true,
  },
  itemId: {
    type: Number,
    required: true,
  },
  orderType: {
    type: String,
    required: true,
  },
});

module.exports = model("Order", OrderSchema);
