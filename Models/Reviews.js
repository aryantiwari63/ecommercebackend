const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
    reviews: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            rating: { type: Number, required: true, min: 1, max: 5 }
        }
    ]
}, { timestamps: true });



module.exports = mongoose.model('Review', reviewSchema);
