const Datamodel = require("../Models/Data");
const useraccountmodel = require("../Models/Useraccount");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const nodemailer = require('nodemailer');

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



    // exports.checklogin = async(req,res) => {
    //     // const {email,password} = req.body;
    //     //  console.log(email);
    //     //       try{
    //     //         const user = await useraccountmodel.findOne({ email });
             
    //     //       console.log(user);
    //     //        if(!user){
    //     //         return res.status(404).json({message:"user not exist"});
    //     //        }
             


    //     // //        console.log("user provide ",password);
    //     // //          console.log("db password",user.password);
    //     // // if (password.trim() !== user.password.trim()) {
    //     // //     console.log("Password incorrect");
    //     // //     return res.status(400).json({ message: "Incorrect password" });
    //     // // }
    //     //         // const isMatch = await user.matchPassword(password);
              
              
              
    //     //         const isMatch = await bcrypt.compare(password, user.password);
    //     //         if (!isMatch) {
    //     //           return res.status(400).json({ message: 'Invalid credentials' });
    //     //         }
    //     //       const token = jwt.sign({ email: user.email }, process.env.secret_key, { expiresIn: '1h' });
              
    //     //        console.log(token);
    //     //        res.status(200).json({ message: 'Login successful', token });
    //     //       }
    //     //       catch(error){
    //     //         res.status(500).json({ message: 'Server error', error });
    //     //       }
    //       const { email, password } = req.body;

    // try {
     
    //   if (!email || !password) {
    //     console.log('Missing email or password');
    //     return res.status(400).json({ message: 'Email and password are required' });
    //   }
  
    //   console.log('Received login request with:', { email, password });
  
    //   const user = await useraccountmodel.findOne({ email });
      
    //   if (!user) {
    //     console.log('User not found');
    //     return res.status(400).json({ message: 'Invalid email or password' });
    //   }
  
    //   const isMatch = await bcrypt.compare(password, user.password);
      
    //   if (!isMatch) {
    //     console.log('Incorrect password');
    //     return res.status(400).json({ message: 'Invalid email or password' });
    //   }
    //   console.log("esv",process.env.SECRET_KEY);
    //    const token = jwt.sign({ id: user._id,email: user.email }, process.env.secret_key, { expiresIn: '1h' });
    
    //   console.log('Login successful');
    //   return res.json({ message: 'Login successful'},token);
      
    // } catch (error) {
    //   console.error('Server error during login:', error);
    //   return res.status(500).json({ message: 'Server error' });
    // }
    // };
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
           
           // Send the email
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
    console.log(token);
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
    user.password = await bcrypt.hash(password, salt);
    await user.save();
      console.log("password saved");
    res.send('Password has been reset');
  };

