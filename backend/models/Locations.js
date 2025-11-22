const mongoose = require('mongoose');

// Define the GeoJSON Point schema as a separate, explicit Mongoose Schema
const PointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'], 
        required: true,
        default: 'Point'
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
    }
}, { _id: false });


const LocationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            required: true,
            trim: true,
        },

        // This field holds the GeoJSON Point data
        location: {
            // Correctly reference the schema structure defined above
            type: PointSchema,
            required: true, // This makes the entire 'location' field mandatory
        },
    },
    {
        timestamps: true,
    }
);

// Explicitly define the 2dsphere index on the 'location' field.
LocationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Location', LocationSchema);