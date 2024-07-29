const express = require("express");
const router = express.Router();
const bodyparser = require("body-parser");
// const Controller = require("../Controllers");
const Datamodel = require("../Models/Data");
const useraccountmodel = require("../Models/Useraccount");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const nodemailer = require('nodemailer');
const Usersontroller = require("../Controllers/Usercontroller")

router.get('/products/:category', Usersontroller.gethomeproducts);
  
router.post('/signup', Usersontroller.createaccount);

router.post('/login',Usersontroller.checklogin );

router.post('/forgotpasswordrequest',Usersontroller.changepasswordrequest);

 router.post('/reset-password/:token',Usersontroller.changepassword);
// router.post('/reset-password/:token', async (req, res) => {
//   const { token } = req.params;
//   const { newpassword } = req.body;
//   console.log(newpassword);
//   let decoded;
//   try {
//     decoded = jwt.verify(token,process.env.SECRET_KEY);
//   } catch (err) {
//     return res.status(400).send('Invalid or expired token');
//   }

//   const user = await useraccountmodel.findById(decoded.id);
//   if (!user) {
//     return res.status(404).send('User not found');
//   }

//   const salt = await bcrypt.genSalt(10);
//   user.password = await bcrypt.hash(password, salt);
//   await user.save();
//     console.log("password saved");
//   res.send('Password has been reset');
// });

  module.exports = router;