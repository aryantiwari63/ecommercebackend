const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://aryantiwari:aglhakuhodo@cluster0.qz6lge5.mongodb.net/ecoproject?retryWrites=true&w=majority&appName=Cluster0");
mongoose.connection.on('connected',()=>{
    console.log('mongodb connected');
})
mongoose.connection.on('error',()=>{
    console.log('error');
}) 


// const mongoose = require("mongoose");

// mongoose.connect("mongodb+srv://aryantiwari:aglhakuhodo@cluster0.qz6lge5.mongodb.net/ecoproject?retryWrites=true&w=majority&appName=Cluster0", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     tls: true, // Enable TLS (default for MongoDB Atlas)
//     tlsAllowInvalidCertificates: false, // Only set to true for testing, not recommended in production
//     appName: "Cluster0",
// });

// mongoose.connection.on('connected', () => {
//     console.log('MongoDB connected successfully');
// });

// mongoose.connection.on('error', (err) => {
//     console.error('MongoDB connection error:', err);
// });

// mongoose.connection.on('disconnected', () => {
//     console.log('MongoDB disconnected');
// });
