const mongoose = require('mongoose');

// Define the GeoJSON Point schema as a separate, explicit Mongoose Schema
const PointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'], // Must be 'Point' for GeoJSON Point structure
        required: true,
        default: 'Point'
    },
    coordinates: {
        type: [Number], // [longitude, latitude] (ALWAYS [longitude, latitude] in GeoJSON)
        required: true
    }
}, { _id: false }); // Use _id: false as sub-documents often don't need their own ID

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

        // CRITICAL FIELD FOR GEOSPATIAL SEARCH ($nearSphere)
        sourceCoordinates: { 
            // Correctly reference the schema structure defined above
            type: PointSchema,
            required: true, 
            // The index must be applied here, on the field that holds the schema
            index: '2dsphere' 
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