const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 3000;

const rideRoutes = require('./routes/rideRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

app.get('/', (req, res) => {
    res.status(200).send('Carpool App Backend MVP is running.');
});

app.use('/api/rides', rideRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handler - must be after all routes
app.use((err, req, res, next) => {
    console.error(err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }
    if (err.code && err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value entered.';
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

mongoose.connect(MONGO_URL)
    .then(() => {console.log('DB connection successful');
        app.listen(PORT, () => {
                console.log(`🚀 Server is running on port ${PORT}`);
            });
        })
    .catch((err) => {console.error(err.message)});



