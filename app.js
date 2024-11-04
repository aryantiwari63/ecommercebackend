const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const connectDB = require('./Config/db');
const userRoutes = require('./routes/index');
const data = require('./Models/Data')
const Useraccount = require('./Models/Useraccount')
dotenv.config();


const app = express();
app.use(express.json({ limit: '20mb' })); 
app.use(express.urlencoded({ extended: true, limit: '20mb' }));



app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
