const express = require("express");
const orderControllers = require("../controllers/orderControllers");
const router = express.Router();

// @route GET && POST - /carousell-listings/
router
  .route("/")
  .post(orderControllers.createNewOrder);

module.exports = router;
