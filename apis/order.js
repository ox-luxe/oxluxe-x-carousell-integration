require("dotenv").config();

const axios = require("axios");

const ShopifyListing = require("../models/ShopifyListing");

class CarousellOrder {
  constructor(shopifyOrder) {
    this.shopifyOrder = shopifyOrder;
    this.shopifyOrderLineItemProductIds = this.getProductIdsFromOrder();
  }

  async getProductCarousellId(productId) {
    let [carousellId, _] = await ShopifyListing.getCarousellId(productId);

    return carousellId[0].id;
  }

  carousellPayloadHeaders() {
    let headers = {
      "Content-Type": "application/json",
      "Api-Key": process.env.API_KEY,
      "App-User-Id": process.env.APP_USER_ID,
    }
    if (process.env.NODE_ENV === 'staging') {
      headers["CF-Access-Client-Secret"] = process.env.CF_ACCESS_CLIENT_SECRET;
      headers["CF-Access-Client-Id"] = process.env.CF_ACCESS_CLIENT_ID;
    }k
    return headers;
  }

  getProductIdsFromOrder() {
    return this.shopifyOrder.line_items.map((lineItem) => lineItem.product_id);
  }
  markProductsAsReserved() {
    const lineItemProductIds = this.shopifyOrderLineItemProductIds;

    lineItemProductIds.forEach(async (productId) => {  
      // get corresponding carousell ID for each product on the order to update status of 
      // corresponding carousell listing to 'Sold'
      const carousellId = await this.getProductCarousellId(productId);
      
      // Post request to Carousell API to update status to 'Sold'
      axios({
        method: "post",
        url: `/els/v2/listings/${carousellId}/status/`,
        baseURL: process.env.API_DOMAIN,
        data: {
          status: "S",
        },
        headers: this.carousellPayloadHeaders(),
      })
        .then(function (response) {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
 
    });
  }
}

module.exports = CarousellOrder;
