const mongoose = require('mongoose');

const navItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
    icon: { type: String, required: true }, 
  });
  
  const Navbar = mongoose.model('NavIcon', navItemSchema);
  
  module.exports = Navbar;
