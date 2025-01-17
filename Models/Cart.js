
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  price:{
    type: Number
  },
  name:{
    type: String
  },
  category:{
    type: String
  },
  imageUrl: {
    type: String
  },
  
});

const CartSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [CartItemSchema]
});

module.exports = mongoose.model('Cart', CartSchema);
