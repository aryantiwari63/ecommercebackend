const Datamodel = require("../Models/Data");
const useraccountmodel = require("../Models/Useraccount");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const nodemailer = require('nodemailer');
const Cart = require("../Models/Cart");
const Check = require("../Models/Checkorder");
const Wishmodel = require("../Models/Wishlist");
// const Review = require('../models/Reviews');
const Navbar = require("../Models/Navbar");

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
        const { name, email, password, image } = req.body;
        console.log(image);
        console.log(email);
        if (!name || !email || !password) {
          return res.status(400).json({ message: 'All fields are required' });
        }
         
        try {
          const newUser = new useraccountmodel({ name, email, password, image });
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
    const product = await Datamodel.findById(productId); 
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const { price, name, category,imageUrl } = product;
    console.log(price,name,category);
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (cart) {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price, name, category,imageUrl });
      }
  
      await cart.save();
      res.status(200).json(cart);
    } else {
      const newCart = new Cart({
        userId: req.user.id,
        items: [{ productId, quantity, price, name, imageUrl }]
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
    const cart = await Cart.findOne({ userId: req.user.id });
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
  try{   
    const userId = req.user.id;
            
             const { id } = req.params;
             const cart =  await Cart.findOne({userId});
              if(!cart){
                console.log("user not find");
              }
                 console.log("cart is ",cart);
                 cart.items = cart.items.filter(item => item.productId.toString() !== id);
                  console.log("cart items filtered",cart.items );
                 await cart.save();
                 console.log("updated cart",cart);
                res.status(200).json({cart});
              }
              catch(error){
                res.status(500).json("server error");
                console.log(error);
              }
  // const { id } = req.params;
  // try {
  //   console.log('id is',id);
     
  //   const result = await Datamodel.findByIdAndDelete(id);
  //   console.log(result); 
  //   if (result) {
  //     res.json({ message: 'Profile deleted successfully!' });
  //   } else {
  //     res.status(404).json({ message: 'Profile not found' });
  //   }
  // } catch (error) {
  //   res.status(500).json({ message: 'Failed to delete profile', error: error.message });
  // }
};


exports.logout = async (req, res) => {
  try {
   
    return res.status(200).json('Logged out successfully');
  } catch (error) {
    return res.status(500).json('Error logging out');
  }
};


  exports.productdetail = async (req, res) => {
  try {
    const product = await Datamodel.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');
    res.json(product);
  } catch (err) {
    res.status(500).send(err.message);
  }
};



  exports.checkorder = async(req,res) =>{
    try{
    const { product, quantity = 1, color, size } = req.body; 
    const price = product.price;
    const userId = req.user.id;
    // const color = req.body.color;
    // const size = req.body.size;        because i write in destructuring
    const user = await useraccountmodel.findOne({_id: userId });
    console.log("user is:",user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
  }

  const userEmail = user.email;
  const userName = user.name;
     console.log(userEmail,userName);
    console.log(color,size);
   
    const userOrderlist = await Check.findOne({ userId });

    if (userOrderlist) {
    
      userOrderlist.orders.push({
        productId: product._id,
        quantity: quantity,
        price: price,
        totalprice: quantity * price,
        name: product.name,
        category: product.category,
        color: color,
        size: size,
        imageUrl: product.imageUrl,
      });

    
      await userOrderlist.save();
 
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userEmail ,
        subject: 'Order Confirmation(Borosil)',
         html: `<p>Dear ${userName}, </p><p> Thank you for your order from Borosil! We’re excited to let you know that your order has been successfully placed.</p>
        <div> <p>   Order Details:</p><p> Order Number: {order.orderNumber}</p><p>Order Date: {currentDate}</p></div>
        <div>Items Ordered:
                      commingsoon
            </div>
            <div><p>Shipping Information:</p><p>Name: ${userName}
            </p><p>Address: {user.address}</p><p>Shipping Method: {order.shippingMethod}</p><p>Estimated Delivery Date: {order.estimatedDeliveryDate}</p></div>
            <div><p>Billing Information:</p><p>Payment Method: {order.paymentMethod}</p><p>Total Amount: {order.totalAmount}</p></div>
            <div><p>What’s Next?</p><p>- We are processing your order and will send you another email once your items are on their way.</p></div>
            <div> <p>  Need Help?</p><p>    - If you have any questions about your order, please contact our support team at [support email] or [support phone number].</p></div>
            <diV>  Thank you for shopping with us!</div>
            <div><p>Best regards,</p><p>Borosil</p></div>`
      };
    
      testaccount.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      console.log("userorderlist" ,userOrderlist);
      res.status(200).json(userOrderlist);
    } else {

      const newOrder = new Check({
        userId: userId,
        orders: [{
          productId: product._id,
          quantity: quantity,
          price: price,
          totalprice: quantity * price,
          name: product.name,
          category: product.category,
          color: color,
          size: size,
          imageUrl: product.imageUrl,
        }]
      });

      await newOrder.save();

     
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userEmail ,
        subject: 'Order Confirmation(Borosil)',
         html: `<p>Dear ${userName}, </p><p> Thank you for your order from Borosil! We’re excited to let you know that your order has been successfully placed.</p>
        <div> <p>   Order Details:</p><p> Order Number: {order.orderNumber}</p><p>Order Date: {currentDate}</p></div>
        <div>Items Ordered:
                      commingsoon
            </div>
            <div><p>Shipping Information:</p><p>Name: ${userName}
            </p><p>Address: {user.address}</p><p>Shipping Method: {order.shippingMethod}</p><p>Estimated Delivery Date: {order.estimatedDeliveryDate}</p></div>
            <div><p>Billing Information:</p><p>Payment Method: {order.paymentMethod}</p><p>Total Amount: {order.totalAmount}</p></div>
            <div><p>What’s Next?</p><p>- We are processing your order and will send you another email once your items are on their way.</p></div>
            <div> <p>  Need Help?</p><p>    - If you have any questions about your order, please contact our support team at [support email] or [support phone number].</p></div>
            <diV>  Thank you for shopping with us!</div>
            <div><p>Best regards,</p><p>Borosil</p></div>`
      };
    
      testaccount.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      console.log("neworder ",newOrder);
      res.status(200).json(newOrder);
    }
  }
catch(error){
  console.log(error);
  res.status(500).json(error);
}

  }



  exports.getorder = async(req, res) => {
    try {
      const userorders = await Check.findOne({ userId: req.user.id });  
      console.log("User orders are:", userorders); 
  
      if (userorders) {
        res.status(200).json({ orders: userorders.orders });  
      } else {
        res.status(200).json({ orders: [] }); 
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

exports.deleteorder = async(req, res) => {

    try {
      const { productId } = req.body; 
      const userId = req.user.id; 
       
      console.log("id is",userId, productId );
      
      const checkorder = await Check.findOne({ userId });
      console.log("user orders is" ,checkorder);
  
      if (!checkorder) {
        return res.status(404).json({ message: 'Order not found' });
      }
       
    
      checkorder.orders = checkorder.orders.filter(order => order.productId.toString() !== productId);
       
     
      await checkorder.save();
     
      res.status(200).json({ message: 'Order deleted', orders: checkorder.orders });
   
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
   
  exports.wishlist = async (req, res) => {
    try {
      const productId = req.params.productId; 
      const userId = req.user.id;
      console.log(productId,userId); 
      const product = await Datamodel.findById(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      let user = await Wishmodel.findOne({ userId: userId });
  
      if (user) {
        const existingWish = user.wishitem.find(item => item.productId.toString() === productId);
  
        if (existingWish) {
          console.log("Wish product already in wishlist");
          return res.status(200).json({ message: 'Product already in wishlist' });
        } else {
          user.wishitem.push({
            productId: productId,
            price: product.price,
            name: product.name,
            category: product.category,
            imageUrl: product.imageUrl,
          });
          await user.save();
          return res.status(200).json({ message: 'Product added to wishlist' });
        }
      } else {
        const newWishlist = new Wishmodel({
          userId: userId,
          wishitem: [{
            productId: productId,
            price: product.price,
            name: product.name,
            category: product.category,
            imageUrl: product.imageUrl,
          }]
        });
        await newWishlist.save(); 
        return res.status(201).json({ message: 'Wishlist created and product added' });
      }
    } catch (error) {
      console.error('Error handling wishlist:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  exports.getwishlist = async (req, res) => {
    try {
      const userId = req.user.id; 
      const user = await Wishmodel.findOne({ userId: userId });
  
      if (user) {
        const wishitems = user.wishitem;
        res.status(200).json({wishitems}); 
      } else {
        res.status(200).json({ message: "No wishlist products found" }); 
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error); 
      res.status(500).json({ message: "Error fetching wishlist", error: error.message }); 
  };
}


exports.navitem = async (req, res) => {
  try {
    const { name, link, icon } = req.body;


    if (!name || !link || !icon) {
      return res.status(400).json({ error: "All fields (name, link, icon) are required" });
    }

    const navitem = new Navbar({ name, link, icon });

    await navitem.save();

   
    res.status(200).json("Nav item added successfully");
  } catch (error) {
    console.error("Error adding nav item:", error);
    res.status(500).json({ error: "Server error, unable to add nav item" });
  }
};

exports.getnavitem = async (req, res) => {
  try {
    console.log("working start");
    const navitems = await Navbar.find(); 
    if (navitems) {
      return res.status(200).json(navitems); 
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error }); 
  }
};




exports.deletewishproduct = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { id } = req.params; 
    const user = await Wishmodel.findOne({ userId });
  
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }
  
    console.log("Wishlist before update: ", user);
  
   
    user.wishitem = user.wishitem.filter(item => item.productId.toString() !== id);
   
  
    await user.save();
  
    console.log("Updated wishlist: ", user);
    res.status(200).json({ message: "Wishlist updated", wishlist: user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    console.error(error);
  }
  
 
};
