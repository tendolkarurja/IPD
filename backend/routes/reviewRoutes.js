const express = require('express');
const { createReview } = require('../controller/reviewController');
const router = express.Router();

router.post('/', createReview);

module.exports = router;