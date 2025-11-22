const Ride = require('../models/Rides');
const Booking = require('../models/Bookings');
const Location = require('../models/Locations');
const mongoose = require('mongoose');

const { findBestCarpoolMatches } = require('../logic/poolMatching'); 

// Wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => 
    Promise.resolve(fn(req, res, next)).catch(next);

const createRide = asyncHandler(async (req, res) => {
    const { driverId, dateTime, sourceId, destinationId, pricePerSeat, totalSeats, sourceGeoJson } = req.body;

    if (!sourceGeoJson || !sourceGeoJson.coordinates) {
        return res.status(400).json({ message: "Source coordinates (GeoJSON) are required." });
    }

    const ride = await Ride.create({
        driverId,
        dateTime: new Date(dateTime),
        source: sourceId, 
        destination: destinationId,
        pricePerSeat,
        totalSeats,
        availableSeats: totalSeats,
        sourceCoordinates: sourceGeoJson,
        status: 'SCHEDULED'
    });

    res.status(201).json({ success: true, data: ride });
});

const searchRides = asyncHandler(async (req, res) => {
    const riderRequest = req.body;

    if (!riderRequest.sourceCoordinates || !riderRequest.capacity || !riderRequest.dateTime || !riderRequest.destinationCoordinates) {
        return res.status(400).json({ message: "Missing required search parameters (sourceCoordinates, capacity, dateTime, destinationCoordinates)." });
    }

    const matches = await findBestCarpoolMatches(riderRequest);

    res.status(200).json({ 
        success: true, 
        count: matches.length,
        data: matches
    });
});


const bookRide = asyncHandler(async (req, res) => {
    const { seatsBooked, riderUserId } = req.body;
    const rideId = req.params.rideId;

    if (!seatsBooked || seatsBooked < 1 || !riderUserId) {
        return res.status(400).json({ message: "Seats booked and rider user ID are required." });
    }

    // Use transaction to ensure atomicity - update ride and create booking together
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const ride = await Ride.findById(rideId).session(session);

        if (!ride) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Ride not found.' });
        }

        if (ride.availableSeats < seatsBooked) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `Only ${ride.availableSeats} seats available.` });
        }

        ride.availableSeats -= seatsBooked;
        await ride.save({ session });

        const booking = await Booking.create([{
            driverTripId: rideId,
            riderUserId,
            seatsBooked,
            status: 'CONFIRMED'
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ success: true, data: booking[0], rideStatus: ride.availableSeats });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error; 
    }
});


module.exports = {
    createRide,
    searchRides,
    bookRide,
};