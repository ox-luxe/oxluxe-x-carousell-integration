const { v4: uuidv4 } = require('uuid')
const axios = require("axios");
const _ = require("lodash");

// database models mainly for creating a unique mapping between Shopify's product and Carousell's product
const ShopifyListing = require("../models/ShopifyListing");
const CarousellListing = require("../models/CarousellListing");

// payload transformer
class CarousellStore {
  constructor(productPayload) {
    this.product = productPayload;
    this.productVendor = this.product.vendor;
    this.productBodyHtml = this.product.body_html;
    this.productSku = this.product.variants[0].sku;
    this.productBrand = this.getMetafieldValue("brand");
    this.productBrandOthers = this.getMetafieldValue("brand_others");
    this.productModel = this.getMetafieldValue("model");
    this.productTitle = this.product.title;
    this.productHandle = this.getProductHandle();
    this.productPhotos = this.getProductPhotos();
    this.productConditionGrade = this.getProductConditionGrade();
    this.productAccessories = this.getProductAccessories();
    this.productLength = this.getProductDimensions()[0];
    this.productWidth = this.getProductDimensions()[1];
    this.productHeight = this.getProductDimensions()[2];
    this.productHasMultipleQuantity = this.productHasMoreThanOneQuantity();
    this.productPrice = this.getProductPrice();
    this.productDescription = this.getMetafieldValue("description");
    this.productGenderType = this.getMetafieldValue("gender");
    this.productType = this.getProductType();
    this.productMaterial = this.getProductMaterial();
    this.productMaterialOthers = this.getMetafieldValue("material_others");
    this.productColor = this.getProductColor();
    this.productShippingMethod = this.getMetafieldValue("shipping_method");
    this.productShippingMethodFee = parseFloat(
      this.getMetafieldValue("shipping_method_fee")
    );
  }
  getProductType() {
    const productType = this.getMetafieldValue("type");
    
    if (productType === 'Handbags') return ' TYPE_HANDBAGS';
    if (productType === 'Shoulder Bags') return 'TYPE_SHOULDER_BAGS';
    if (productType === 'Backpacks') return 'TYPE_BACKPACKS';
    if (productType === 'Travel Bags') return 'TYPE_TRAVEL_BAGS';
    if (productType === 'Clutch') return 'TYPE_CLUTCH';
    if (productType === 'Cross-body') return 'TYPE_CROSSBODY';
  }
  getProductMaterial() {
    const productMaterial = this.getMetafieldValue("material");

    if (productMaterial === 'Canvas') return 'MATERIAL_CANVAS';
    if (productMaterial === 'Caviar') return 'MATERIAL_CAVIAR';
    if (productMaterial === 'Cotton') return 'MATERIAL_COTTON';
    if (productMaterial === 'Denim') return 'MATERIAL_DENIM';
    if (productMaterial === 'Lambskin') return 'MATERIAL_LAMBSKIN';
    if (productMaterial === 'Leather') return 'MATERIAL_LEATHER';
    if (productMaterial === 'Linen') return 'MATERIAL_LINEN';
    if (productMaterial === 'Nylon') return 'MATERIAL_NYLON';
    if (productMaterial === 'Patent Leather') return 'MATERIAL_PATENT_LEATHER';
    if (productMaterial === 'Plastic') return 'MATERIAL_PLASTIC';
    if (productMaterial === 'Pony Hair') return 'MATERIAL_PONY_HAIR';
    if (productMaterial === 'PVC') return 'MATERIAL_PVC';
    if (productMaterial === 'Sequin') return 'MATERIAL_SEQUIN';
    if (productMaterial === 'Suede') return 'MATERIAL_SUEDE';
    if (productMaterial === 'Tweed') return 'MATERIAL_TWEED';
    if (productMaterial === 'Others') return 'MATERIAL_OTHERS';
  }
  getProductColor() {
    // Shopify Metafield value: Brown, Red, Blue, etc..
    const metafieldColor = this.getMetafieldValue("color"); 

    if (metafieldColor === 'Beige') return "COLOUR_BEIGE";
    if (metafieldColor === 'Black') return "COLOUR_BLACK";
    if (metafieldColor === 'Blue') return "COLOUR_BLUE";
    if (metafieldColor === 'Brown') return "COLOUR_BROWN";
    if (metafieldColor === 'Burgundy') return "COLOUR_BURGUNDY";
    if (metafieldColor === 'Gold') return "COLOUR_GOLD";
    if (metafieldColor === 'Green') return "COLOUR_GREEN";
    if (metafieldColor === 'Grey') return "COLOUR_GREY";
    if (metafieldColor === 'Multi-Color') return "COLOUR_MULTI_COLOUR";
    if (metafieldColor === 'Navy') return "COLOUR_NAVY";
    if (metafieldColor === 'Orange') return "COLOUR_ORANGE";
    if (metafieldColor === 'Pink') return "COLOUR_PINK";
    if (metafieldColor === 'Purple') return "COLOUR_PURPLE";
    if (metafieldColor === 'Red') return "COLOUR_RED";
    if (metafieldColor === 'Silver') return "COLOUR_SILVER";
    if (metafieldColor === 'White') return "COLOUR_WHITE";
    if (metafieldColor === 'Yellow') return "COLOUR_YELLOW";
    if (metafieldColor === 'Others') return "COLOUR_OTHERS";
  }
  getMetafieldValue(property) {
    let metafield = this.product.metafields.filter(
      (metafield) => metafield.key === property
    )[0];
    if (metafield) {
      return metafield.value;
    }
  }
  getProductHandle() {
    return this.product.title.toLowerCase().split(" ").join("-");
  }
  getProductPhotos() {
    let photos = [];
    this.product.images.forEach((image) => photos.push(image.src));
    return photos.slice(0, 10);
  }
  getProductConditionGrade() {
    const conditionGrade = this.getMetafieldValue("condition_grade");
    if (conditionGrade) {
      if (conditionGrade === "Unused") return 3;
      if (conditionGrade === "Like New Condition") return 4;
      if (conditionGrade === "Very Good Condition") return 7;
      if (conditionGrade === "Good Condition") return 5;
      if (conditionGrade === "Fair Condition") return 6;
    }
  }
  getProductPrice() {
    return this.product.variants[0].price;
  }
  getProductAccessories() {
    // returns an array of all user defined accessories related to product.
    const metafields = this.product.metafields;
    const productAccessories = metafields.filter((metafield) =>
      metafield.key.includes("accessories")
    );
    if (productAccessories.length) {
      return productAccessories.map((metafield) => metafield.value);
    }
  }
  getProductDimensions() {
    /* returns user defined dimensions [length, width, height]
     * e.g.
     * User Input: (L)32cm x (H)23cm x (W)8cm
     * User Output: [32, 23, 8]
     */
    if (this.getMetafieldValue("dimension") === undefined) return [0, 0, 0];

    const dimensions = this.getMetafieldValue("dimension")
      .toLowerCase()
      .split("x");

    if (dimensions.length) {
      const regexLength = /[Ll]/;
      const regexWidth = /[WwDd]/;
      const regexHeight = /[Hh]/;

      let length, width, height;

      dimensions.forEach((dimension) => {
        if (regexLength.test(dimension))
          length = parseFloat(dimension.replace(/[^0-9.,]/g, ""));
        if (regexWidth.test(dimension))
          width = parseFloat(dimension.replace(/[^0-9.,]/g, ""));
        if (regexHeight.test(dimension))
          height = parseFloat(dimension.replace(/[^0-9.,]/g, ""));
      });
      return [length || 0, width || 0, height || 0];
    }
  }
  productHasMoreThanOneQuantity() {
    return this.product.variants[0].inventory_quantity > 1 ? true : false;
  }
  createCarousellListingTitle() {
    if (this.productVendor === "Louis Vuitton") {
      return this.productVendor + " LV " + this.productTitle + " oxluxe";
    }
    if (this.productVendor === "Saint Laurent") {
      return this.productVendor + " YSL " + this.productTitle + " oxluxe";
    }
    return this.productVendor + " " + this.productTitle + " oxluxe";
  }
  createV3ApiPayload() {
    let data = {
      "request_version": "1",
      "category": "SG_LUXURY_HANDBAGS",
      "listing_type": "advance_promise",
      "is_advance_promise_enabled": "true",
      "cgproduct_id": "P12345678",
      "cgproduct_variant_id": "PV12345789",
      "notes_on_condition": "minor scratches",
      "seller_reference_code": "123454321",
      "title": this.createCarousellListingTitle(),
      "price": parseFloat(this.productPrice),
      "photos": this.productPhotos, // to replace with this.productPhotos when ready
      "layered_condition": this.productConditionGrade,
      "description": this.productDescription,
      "meetup": true,
      "meetup_name_0": "79 Ayer Rajah Crescent #0301, Singapore 139955",
      "meetup_address_0": "Ayer Rajah Crescent",
      "meetup_note_0": "some notes",
      "meetup_latitude_0": "1.2979591",
      "meetup_longitude_0": "103.7874864",
      multi_quantities: this.productHasMultipleQuantity,
      brand_enum: this.productBrand,
      model: this.productModel,
      gender: this.productGenderType,
      bags_wallets_type: this.productType,
      bags_wallets_material: this.productMaterial,
      bags_wallets_color: this.productColor,
      bags_wallets_length: this.productLength,
      bags_wallets_width: this.productWidth,
      bags_wallets_height: this.productHeight,
      bags_wallets_accessories: this.productAccessories,
      "shipping_sameday_delivery": false,
      "shipping_standard_delivery": true,
      "shipping_standard_delivery_fee": 0 // shipping is free for Ox Luxe's customers
    };
    return data;
  }
  productHasNoVariants() {
    return (
      this.product.variants.length === 1 &&
      this.product.variants[0].title.includes("Default")
    );
  }
  async getProductCarousellId() {
    let [carousellId, _] = await ShopifyListing.getCarousellId(this.product.id);

    return carousellId[0].id;
  }
  carousellPayloadHeaders() {
    let headers = {
      "Content-Type": "application/json",
      "Api-Key": process.env.API_KEY,
      "App-User-Id": process.env.APP_USER_ID,
    };
    if (process.env.NODE_ENV === "staging") {
      headers["CF-Access-Client-Secret"] = process.env.CF_ACCESS_CLIENT_SECRET;
      headers["CF-Access-Client-Id"] = process.env.CF_ACCESS_CLIENT_ID;
    }
    return headers;
  }
  createListing() {
    let v3ApiPayload;

    if (this.productHasNoVariants()) {
        v3ApiPayload = this.createV3ApiPayload();
        v3ApiPayload.external_id = uuidv4();

        let config = {
          method: 'post',
          url: process.env.API_DOMAIN+'/els/v3/listings/',
          headers: this.carousellPayloadHeaders(),
          data : JSON.stringify(v3ApiPayload)
        };
        
        axios.request(config)
        .then(async (response) => {
          console.log(JSON.stringify(response.data));

          try {
            // create 1-1 product mapping
            let shopifyListing = new ShopifyListing(this.product.id, this.productTitle, this.productSku);
            shopifyListing = await shopifyListing.save();

            let carousellListing = new CarousellListing(response.data.id, response.data.carousell_listing_id, v3ApiPayload.title, this.product.id);
            carousellListing = await carousellListing.save();
          } catch (error) {
            console.log(error);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    // We can create the case where the product has variants here if needed in future
    return;
  }
  async updateListing() {
    const thisCarousellStore = this;
    const carousellId = await this.getProductCarousellId();
    // sending new updates to product attributes to Carousell Store

    let v3ApiPayload = this.createV3ApiPayload();
    v3ApiPayload.unique_identifier = carousellId;

    axios({
      method: "put",
      baseURL: process.env.API_DOMAIN,
      url: `/els/v3/listings/`,
      headers: thisCarousellStore.carousellPayloadHeaders(),
      data: JSON.stringify(v3ApiPayload),
    })
    .then(function (response) {
      console.log("successfully updated carousell product listing");
      console.log(response);
    })
    .catch((error) => {
      console.log("error from update listing function");
      console.log(error);
    });
  }

  static delete(productId) {
    // to implement in future when Carousell's delete API is ready
  }
}

module.exports = CarousellStore;
