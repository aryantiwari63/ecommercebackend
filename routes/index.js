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
// const paypal = require("../Controllers/Paypal");
const Cart = require("../Models/Cart");
const Review = require("../Models/Reviews");


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
 
 router.delete('/deletecartproduct/:id',authmiddleware,Usersontroller.deletecartproduct);

 router.post('/logout', Usersontroller.logout);


router.post('/updateCartQuantity', authmiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id; 
  
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
   
    
    const item = cart.items.find(item => item.productId.equals(productId));
    console.log("item is:",item);
    if (item) {
      item.quantity = quantity;
      await cart.save();
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/productdetail/:id', Usersontroller.productdetail);
router.post('/orderlist',authmiddleware, Usersontroller.checkorder);
router.get('/userorder',authmiddleware, Usersontroller.getorder );
router.delete('/deleteorder' ,authmiddleware, Usersontroller.deleteorder);

router.post('/reviews',authmiddleware, async (req, res) => {
  try {
      const { productId,  rating } = req.body;
      const userId = req.user.id; 
      
      let productReviews = await Review.findOne({ productId });

      if (productReviews) {

          const existingReviewIndex = productReviews.reviews.findIndex(review => review.userId.toString() === userId);

          if (existingReviewIndex !== -1) {
         
              productReviews.reviews[existingReviewIndex].rating = rating;
          } else {
            
              productReviews.reviews.push({ userId, rating });
          }
      } else {
          
          productReviews = new Review({ productId, reviews: [{ userId, rating }] });
      }

      await productReviews.save();
      res.status(201).json(productReviews);
  } catch (error) {
      res.status(500).json({ message: 'Server Error', error });
  }
});

router.get('/reviews/:productId', async (req, res) => {
 
  try {
    const { productId } = req.params;

    const review = await Review.findOne({ productId });
    if (!review) {
        return res.status(404).json({ message: 'No reviews found for this product' });
    }

    const totalReviews = review.reviews.length;
    const starCounts = [0, 0, 0, 0, 0];

    review.reviews.forEach((r) => {
        starCounts[r.rating - 1] += 1;
    });

    const ratingsPercentage = starCounts.map((count) => (count / totalReviews) * 100);
    const averageRating = (review.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) || 0;

    res.status(200).json({
      reviews: review.reviews,
        totalReviews,
        averageRating,
        ratingsPercentage,
    });
    
} catch (error) {
   
    res.status(500).json({ message: 'Server Error', error });
}
});


router.post('/wishlist/:productId',authmiddleware, Usersontroller.wishlist);

router.get('/getwishlist',authmiddleware, Usersontroller.getwishlist);


router.delete( '/deletewishlist/:id',authmiddleware,Usersontroller.deletewishproduct)

router.post('/uploadProfileImage',authmiddleware, async (req, res) => {
  try {
    if (!req) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
     
    
    const  {url} = req.body;
    console.log("uploaddata",url);
    let imageString;
if (typeof url === 'object') {
  imageString = JSON.stringify(url); 
  console.log("imageString",imageString);
} else if (typeof url === 'string') {
  imageString = url;  
  console.log("imageString",imageString);
} else {
  return res.status(400).json({ message: 'Invalid file format' });
}
    const userid = req.user.id;
    
    const user = await useraccountmodel.findById(userid); 
    console.log("User id",user);
    
    if(user){
     user.image= imageString;
   
    await user.save();
    

    res.status(201).json({
      message: 'File uploaded successfully',
      user: {
        image: user.image,
      
      },
  
    });
  }
  else{
    console.log({message: "usernotfound"});
    res.json({message: 'user not find'});
  }
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post("/navitem", Usersontroller.navitem);

router.get("/getnavitem", Usersontroller.getnavitem);

// router.post("/order",paypal.payProduct );






  module.exports = router;
