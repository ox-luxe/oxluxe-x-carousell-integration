/* The purpose of the function checkListingIdValue is to check whether a new, 
 * updated or deletion of a listing is required.
 */

const _ = require('lodash');
// database model
const ShopifyListing = require("../models/ShopifyListing");

exports.listingRequestType = async (req, res, next) => {
  console.log("webhook received! id: " + req.headers["x-shopify-webhook-id"]);
  
  // Listing Type: CP listing.
  if (shouldNotUpdateListing(req.body)) {
    req.shouldNotUpdateListing = true;
    next();
  } 

  // Listing Type: AP listing, new product creation
  if (await productIsNotlistedBefore()) {
    try {
      // Product created on Shopify does not have variant.
      if (productHasDefaultVariant(req.body)) {
        req.shouldCreateListing = true;
        next(); // create new listing
      } else {
        console.log('res send 200 with user defined variants');
        res.status(200).json({ message: "received webhook" });
      }
    } catch (error) {
      next(error);
    }
  }

  // Listing Type: AP listing, update to product required
  if (await productIsListedBefore() && _.size(req.body) !== 1) {
    try {
      req.shouldUpdateListing = true;
      console.log("Carousell listing id exists, checking if an update is needed. . .");
      next();

    } catch (error) {
      next(error);
    }
  }
  
  // Listing Type: AP listing, deletion of product required
  // 24th March 2023: please note that there are still issues with Carousell's delete API so the delete functionality 
  // is not yet implemented in this service.
  if (await productIsListedBefore() && _.size(req.body) === 1) {
    try {
      // delete listing from Carousell store
      req.shouldDeleteListing = true;
      next();
    } catch (error) {
      next(error);
    }
  }
  // helper functions
  async function productIsListedBefore() {
    try {
      let [product, _] = await ShopifyListing.findById(req.body.id);
      return product.length === 1;

    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async function productIsNotlistedBefore() {
    return !(await productIsListedBefore());
  }
  
};

function productHasDefaultVariant(productPayload) {
  return (
    productPayload.variants.length === 1 &&
    productPayload.variants[0].title === "Default Title"
  );
}
function getMetafieldValue(requestBody, property) {
  let metafield = requestBody.metafields.filter(
    (metafield) => metafield.key === property
  )[0];
  if (metafield) {
    return metafield.value;
  }
}
function shouldNotUpdateListing(requestBody) {
  return !shouldUpdateListing(requestBody);
}
function shouldUpdateListing(requestBody) {
  const shouldSync = getMetafieldValue(requestBody, "should_sync");
  console.log(shouldSync);
  return shouldSync == true || shouldSync == undefined;
}
