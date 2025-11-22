const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
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

module.exports = mongoose.model('Review', ReviewSchema);