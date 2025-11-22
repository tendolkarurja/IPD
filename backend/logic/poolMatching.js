const mongoose = require('mongoose');
const Ride = require('../models/Rides'); 

// Stub - replace with actual routing service when available
function validateFeasibility(driverRide, riderRequest) {
    return Promise.resolve({
        isFeasible: true,
        detourTimeIncreaseMinutes: 5
    });
} 

const pickup_rad = 2000; // meters
const max_time_dev = 30; // minutes

async function findBestCarpoolMatches(riderRequest) {
    const requestDateTime = riderRequest.dateTime instanceof Date 
        ? riderRequest.dateTime 
        : new Date(riderRequest.dateTime);
    
    const minTime = new Date(requestDateTime.getTime() - max_time_dev * 60000);
    const maxTime = new Date(requestDateTime.getTime() + max_time_dev * 60000);
    
    // GeoNear query to find rides within pickup radius
    const pipeline = [
        {
            $geoNear: {
                near: riderRequest.sourceCoordinates, 
                distanceField: "distance",
                maxDistance: pickup_rad, 
                spherical: true,
                query: { 
                    status: 'SCHEDULED', 
                    availableSeats: { $gte: riderRequest.capacity },
                    dateTime: { $gte: minTime, $lte: maxTime }
                }
            }
        },
    ];

    try {
        const potentialMatches = await Ride.aggregate(pipeline); 
        console.log(`Database found ${potentialMatches.length} initial potential matches.`);
        
        const feasibleMatches = [];
        
        // Check feasibility for each match
        const feasibilityChecks = potentialMatches.map(driverRide => 
            validateFeasibility(driverRide, riderRequest)
                .then(detourResult => ({ driverRide, detourResult }))
        );

        const results = await Promise.all(feasibilityChecks);

        // Score and filter feasible matches
        for (const { driverRide, detourResult } of results) {
            if (detourResult.isFeasible) {
                driverRide.detourTimeIncreaseMinutes = detourResult.detourTimeIncreaseMinutes;
                // Higher score = better match (lower distance, lower detour time)
                driverRide.matchScore = 1000 - driverRide.distance - (detourResult.detourTimeIncreaseMinutes * 50); 
                feasibleMatches.push(driverRide);
            }
        }
        
        feasibleMatches.sort((a, b) => b.matchScore - a.matchScore);
        
        return feasibleMatches;

    } catch (error) {
        console.error("Critical error in findBestCarpoolMatches:", error);
        return [];
    }
}

module.exports = {
    findBestCarpoolMatches,
    pickup_rad,
    max_time_dev,
};