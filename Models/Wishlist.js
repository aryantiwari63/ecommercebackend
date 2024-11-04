
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
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

const WishSchema = new Schema({
  userId: {
    
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wishitem: [WishItemSchema]
});

module.exports = mongoose.model('Wishlist', WishSchema);
