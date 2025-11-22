const mongoose = require('mongoose');

const User = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        isDriver:{
            type: Boolean,
            default: false
        },

        carDetails:{
            type: Object,
            require: function() { return this.isDriver; },
            default: null
        },

        averageRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },

        ridesCompleted: {
            type: Number,
            default: 0,
            min: 0,
        },

        private_data: {
            type: Object,
            default: {},
        },
    },

    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', User);