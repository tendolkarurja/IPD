const mongoose = require('mongoose');


const RideSchema = new mongoose.Schema(
    {
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true,
        },
        
        dateTime: {
            type: Date,
            required: true,
            index: true, 
        },

        source: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: true,
        },

        destination: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: true,
        },

        pricePerSeat: {
            type: Number,
            required: true,
            min: 0,
        },

        totalSeats: {
            type: Number,
            required: true,
            min: 1,
        },

        availableSeats: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            default: 'SCHEDULED',
            index: true,
        },
        
        driverRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Ride', RideSchema);