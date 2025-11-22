const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    driverTripId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ride', 
        required: true 
    },
    riderUserId: { 
        type: String, 
        required: true 
    },
    seatsBooked: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
        default: 'CONFIRMED'
    },
    bookingTime: { 
        type: Date, 
        default: Date.now 
    }
});

BookingSchema.index({ driverTripId: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);