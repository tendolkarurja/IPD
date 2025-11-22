const mongoose = require('mongoose');

const GeoJsonPointSchema = {
    type: {
        type: String,
        enum: ['Point'], 
        required: true
    },
   
    coordinates: {
        type: [Number],
        required: true,
    }
};

const Location = new mongoose.Schema(
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

        location: {
            type: GeoJsonPointSchema,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

Location.index({ location: '2dsphere' });
module.exports = mongoose.model('Location', Location);