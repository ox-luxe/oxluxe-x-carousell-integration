const express = require("express");
const CarousellListingControllers = require("../controllers/listingControllers");
const classify = require("../middlewares/classifyListingRequestType");
const router = express.Router();

// @route POST - /listing/
router
  .route("/")
  .post(
    classify.listingRequestType,
    CarousellListingControllers.createOrUpdateListing,
    CarousellListingControllers.deleteListing
  );


module.exports = router;
