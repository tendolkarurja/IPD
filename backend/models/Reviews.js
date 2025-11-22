const mongoose = require('mongoose');

const Review = new mongoose.Schema(
    {
        targetUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true, 
        },

        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        rideId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ride',
            required: true,
        },
        
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        comment: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate reviews for same ride/user combination
Review.index({ rideId: 1, reviewerId: 1, targetUserId: 1 }, { unique: true });
module.exports = mongoose.model('Review', Review);