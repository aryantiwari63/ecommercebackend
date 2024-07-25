const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userschema = new mongoose.Schema({
      name: String,
      email: String,
      password: String
})

userschema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  

//   userschema.methods.matchPassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
//   };

module.exports = mongoose.model('Useraccount',userschema);