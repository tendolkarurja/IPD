const express = require('express');
const { createRide, searchRides, bookRide } = require('../controller/rideController');
const router = express.Router();

// Base route: /api/rides

router.post('/', createRide);
router.post('/search', searchRides);
router.post('/:rideId/book', bookRide);


module.exports = router;