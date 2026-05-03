const express = require("express");
const router = express.Router();

const { getReviews } = require("../controllers/reviewController");

router.get("/getReviews", getReviews);

module.exports = router;
