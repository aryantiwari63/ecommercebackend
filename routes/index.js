const express = require("express");
const router = express.Router();
const bodyparser = require("body-parser");

const Datamodel = require("../Models/Data");
const useraccountmodel = require("../Models/Useraccount");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const nodemailer = require('nodemailer');
const Usersontroller = require("../Controllers/Usercontroller");


// const authmiddleware = (req,res,next) => {
//         const authheader = req.header('Authorization');
//         console.log(authheader);
//         if(!authheader){
//             return res.status(401).json({message:'no token'});
//         }
//         try{
//             const decoded = jwt.verify(authheader,process.env.SECRET_KEY);
//              console.log("decoded",decoded);
//              req.user=decoded;
//              next();
//         }
//         catch(error){
//             return res.status(401).json({message:'token is not valid'});
//         }
// }
const authmiddleware = (req, res, next) => {
    const authheader = req.header('Authorization');
    console.log('Authorization Header:', authheader);
    if (!authheader) {
      return res.status(401).json({ message: 'no token' });
    }
  
    // Extract the token part after 'Bearer '
    // const token = authheader.replace('Bearer ', '');
    const token= authheader;
    console.log('Token:', token);
  
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log('Decoded:', decoded);
      req.user = decoded;
      next();
    } catch (error) {
      console.log('Token Verification Error:', error);
      return res.status(401).json({ message: 'token is not valid' });
    }
  };
  
  module.exports = authmiddleware;
  


router.get('/products/:category', Usersontroller.gethomeproducts);
  
router.post('/signup', Usersontroller.createaccount);

router.post('/login',Usersontroller.checklogin );

router.post('/forgotpasswordrequest',Usersontroller.changepasswordrequest);

 router.post('/reset-password/:token',Usersontroller.changepassword);


 router.get('/profiledata',authmiddleware,Usersontroller.profiledata);

 router.post('/addtocart',authmiddleware,Usersontroller.addtocart);

 router.get('/usercart',authmiddleware,Usersontroller.usercart);

 
 router.post('/incquantity',authmiddleware,Usersontroller.increaseQuantity);

 router.post('/decquantity',authmiddleware,Usersontroller.decreaseQuantity);
 
router.delete('/deletecartproduct/:id',Usersontroller.deletecartproduct);

 router.post('/logout', Usersontroller.logout);

  module.exports = router;