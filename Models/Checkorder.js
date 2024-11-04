const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const checkorderSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  price: {
    type: Number
  },
  totalprice: {
    type: Number
  },
  name: {
    type: String
  },
  category: {
    type: String
  },
  color:{
    type: String
  },
  size:{
    type: String
  },
  imageUrl: {
    type: String
  },
});

const CheckSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orders: [ checkorderSchema]
});

module.exports = mongoose.model('Checkorder',CheckSchema );