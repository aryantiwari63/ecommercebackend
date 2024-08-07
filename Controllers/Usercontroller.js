const Datamodel = require("../Models/Data");
const useraccountmodel = require("../Models/Useraccount");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const nodemailer = require('nodemailer');
const Cart = require("../Models/Cart");
dotenv.config(); 


const testaccount = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  }
});



exports.gethomeproducts =async(req, res) => {
    try{
    const category = req.params.category;
      const data = await Datamodel.find({category: category});
      console.log(data);
      res.json(data);
    }catch(error){
      console.error(error);
      res.status(500).send('Server Error');
    }
    }

    exports.createaccount = async (req, res) => {
        const { name, email, password } = req.body;
        console.log(email);
        if (!name || !email || !password) {
          return res.status(400).json({ message: 'All fields are required' });
        }
      
        try {
          const newUser = new useraccountmodel({ name, email, password });
          await newUser.save();
          res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
          res.status(500).json({ message: 'Server error', error });
        }
      };



    exports.checklogin = async (req, res) => {
      const { email, password } = req.body;
  
      try {
          if (!email || !password) {
              console.log('Missing email or password');
              return res.status(400).json({ message: 'Email and password are required' });
          }
  
          console.log('Received login request with:', { email, password });
  
          const user = await useraccountmodel.findOne({ email });
  
          if (!user) {
              console.log('User not found');
              return res.status(400).json({ message: 'Invalid email or password' });
          }
  
          const isMatch = await bcrypt.compare(password, user.password);
  
          if (!isMatch) {
              console.log('Incorrect password');
              return res.status(400).json({ message: 'Invalid email or password' });
          }
  
          const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '1h' });
  
          console.log('Login successful');
          return res.status(200).json({ message: 'Login successful', token });
  
      } catch (error) {
          console.error('Server error during login:', error);
          return res.status(500).json({ message: 'Server error' });
      }
  };
  


  exports.changepasswordrequest = async(req,res) =>{
    
           const {email} = req.body;
           console.log(email);
           const usercheck = await useraccountmodel.findOne({email}); 
           console.log(usercheck);
           if(!usercheck){
             return res.status(404).send('User not found');
           }
           
           const token = jwt.sign({id: usercheck._id,email: usercheck.email}, process.env.SECRET_KEY,{expiresIn: '1h'});
          
           console.log(token);
           const resetURL = `http://localhost:3000/reset-password/${token}`; 
             console.log(resetURL);
       
           const mailOptions = {
             from: process.env.GMAIL_USER,
             to: usercheck.email,
             subject: 'Sending Email using Node.js',
              html: `<p>You requested a password reset</p><p>Click this <a href="${resetURL}">link</a> to reset your password</p>`
           };
         
           testaccount.sendMail(mailOptions, function(error, info){
             if (error) {
               console.log(error);
             } else {
               console.log('Email sent: ' + info.response);
             }
           });

           res.json("email send");
         
         
  };

  exports.changepassword = async (req, res) => {
    const { token } = req.params;
    const { newpassword } = req.body;
    console.log(newpassword);
    console.log("token from mail",token);
    let decoded;
    try {
      decoded = jwt.verify(token,process.env.SECRET_KEY);
    } catch (err) {
      return res.status(400).send('Invalid or expired token');
    }
  
    const user = await useraccountmodel.findById(decoded.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newpassword, salt);
    await user.save();
      console.log("password saved");
    res.send('Password has been reset');
  };

exports.profiledata = async(req,res) => {
       try{
          const user = await useraccountmodel.findById(req.user.id).select('-password');
           console.log(user);
          res.json(user);
        }
catch(error){
       res.status(500).json({message:'server error'});
}
};

exports.addtocart = async(req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Datamodel.findById(productId); // Assuming you are using _id for finding products
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const { price, name } = product;
    console.log(price,name);
    const cart = await Cart.findOne({ userId: req.user.id });

    if (cart) {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price, name });
      }

      await cart.save();
      res.status(200).json(cart);
    } else {
      const newCart = new Cart({
        userId: req.user.id,
        items: [{ productId, quantity, price, name }]
      });

      await newCart.save();
      res.status(200).json(newCart);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.usercart = async(req,res) =>{
  try {
      console.log(req.user.id);
    const cart = await Cart.findOne({ userId: req.user.id });  //.populate('items.productId'); Populate product details
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    console.log(cart);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.increaseQuantity = async (req, res) => {
  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex >= 0) {//0 because if not find then return -1 so we can check >-1 or >=0
      cart.items[itemIndex].quantity += 1;
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.decreaseQuantity = async (req, res) => {
  const { productId } = req.body;
  console.log(productId,"work");
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex >= 0) {
      if (cart.items[itemIndex].quantity > 0) {
        cart.items[itemIndex].quantity -= 1;
      }
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletecartproduct = async (req, res) => {
  const { id } = req.params;
  try {
    console.log('id is',id);
     
    const result = await Datamodel.findByIdAndDelete(id);
    console.log(result); 
    if (result) {
      res.json({ message: 'Profile deleted successfully!' });
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete profile', error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
   
    return res.status(200).json('Logged out successfully');
  } catch (error) {
    return res.status(500).json('Error logging out');
  }
};