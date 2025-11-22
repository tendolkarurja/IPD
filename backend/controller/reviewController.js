const Review = require('../models/Reviews');
const User = require('../models/Users');
const Ride = require('../models/Rides'); // <-- Added Ride model reference
const mongoose = require('mongoose');

// Utility function to handle try/catch in controller
const asyncHandler = fn => (req, res, next) => 
    Promise.resolve(fn(req, res, next)).catch(next);


/**
 * Calculates and updates the average rating for a target user.
 * This uses the MongoDB Aggregation Pipeline for efficient calculation of 
 * average rating and total review count.
 * @param {mongoose.Types.ObjectId} userId The ID of the user whose rating needs updating.
 */
const updateAverageRating = async (userId) => {
    // 1. Calculate the new average rating and count of reviews (ridesCompleted)
    const result = await Review.aggregate([
        { $match: { targetUserId: userId } },
        {
            $group: {
                _id: '$targetUserId',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    if (result.length > 0) {
        const { averageRating, reviewCount } = result[0];
        
        // 2. Update the User document atomically
        await User.findByIdAndUpdate(userId, {
            averageRating: averageRating.toFixed(2), // Round to 2 decimal places
            ridesCompleted: reviewCount // Assuming one review means one completed ride
        });
    } else {
        // Reset if no reviews exist (shouldn't happen here, but good practice)
        await User.findByIdAndUpdate(userId, {
            averageRating: 0,
            ridesCompleted: 0
        });
    }
};


/**
 * Core validation function to ensure both the reviewer and the target 
 * participated in the specified ride.
 * @param {string} rideId The ID of the ride being reviewed.
 * @param {string} reviewerId The ID of the person giving the rating.
 * @param {string} targetUserId The ID of the person receiving the rating.
 * @returns {Promise<boolean>} True if the users participated in the ride, false otherwise.
 */
const checkRideParticipation = async (rideId, reviewerId, targetUserId) => {
    // 1. Check if the target was the driver of the ride
    const isTargetDriver = await Ride.findOne({
        _id: rideId,
        driverId: targetUserId
    });

    // 2. Check if the reviewer was a rider/booker on this ride
    const isReviewerRider = await Booking.findOne({
        driverTripId: rideId,
        riderUserId: reviewerId,
        status: 'COMPLETED' // Only allow reviews for completed rides
    });

    // 3. Check mutual relationship (Target is driver & Reviewer is rider, OR vice-versa)
    if (isTargetDriver && isReviewerRider) {
        // Case A: Rider (reviewer) reviews Driver (target)
        return true;
    } 

    // Case B: Driver (reviewer) reviews Rider (target). 
    // Requires a more complex check on the Booking model or additional logic
    // but for MVP, we'll keep the direct relationship logic simple:
    
    // For MVP simplicity, we only allow rider-to-driver reviews where the ride is completed.
    // If you need driver-to-rider reviews, you'd add similar logic checking the ride and booking status.

    return false;
};


// @desc    Create a new review (rating a driver or rider)
// @route   POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
    const { targetUserId, reviewerId, rideId, rating, comment } = req.body;

    // 1. Basic validation
    if (!targetUserId || !reviewerId || !rideId || !rating) {
        return res.status(400).json({ message: "Missing required review fields (targetUser, reviewer, rideId, rating)." });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }
    if (targetUserId.toString() === reviewerId.toString()) {
        return res.status(400).json({ message: "Users cannot review themselves." });
    }

    // 2. Validate participation in the ride (New Critical Check)
    const isParticipant = await checkRideParticipation(rideId, reviewerId, targetUserId);
    if (!isParticipant) {
        return res.status(403).json({ message: "Reviewer and target were not valid participants of the specified ride, or the ride is not completed." });
    }


    // 3. Transaction Block
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 4. Create the new review document
        const review = await Review.create([{
            targetUserId,
            reviewerId,
            rideId,
            rating,
            comment
        }], { session });

        // 5. Update the aggregated stats on the target user 
        await updateAverageRating(targetUserId);

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ success: true, data: review[0], message: "Review submitted and user rating updated." });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        
        if (error.code === 11000) {
            return res.status(409).json({ message: "You have already submitted a review for this ride/target combination." });
        }
        throw error;
    }
});


module.exports = {
    createReview,
};