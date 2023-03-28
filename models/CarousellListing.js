const db = require("../config/db");

class CarousellListing {
  constructor(id, carousellId, productTitle, shopifyProductId) {
    this.id = id;
    this.carousellId = carousellId;
    this.productTitle = productTitle;
    this.productHandle = this.getProductHandle();
    this.shopifyProductId = shopifyProductId;
    this.productListingUrl = this.getCarousellProductListingUrl();
  }

  getProductHandle() {
    return this.productTitle.toLowerCase().split(" ").join("-");
  }

  getCarousellProductListingUrl() {
    return `https://api.carousell.com/p/${this.productHandle}-${this.carousellId}`;
  }

  save() {
    let d = new Date();
    let yyyy = d.getFullYear();
    let mm = d.getMonth() + 1;
    let dd = d.getDate();

    let createdAtDate = `${yyyy}-${mm}-${dd}`;

    let sql = `
    INSERT INTO carousell_listings(
      id,
      carousell_id,
      product_title,
      created_at,
      shopify_product_id,
      listing_url
    )
    VALUES(
      '${this.id}',
      '${this.carousellId}',
      '${this.productTitle}',
      '${createdAtDate}',
      '${this.shopifyProductId}',
      '${this.productListingUrl}'
    )
    `;

    return db.execute(sql);
  }

  static findById(id) {
    let sql = `SELECT * FROM carousell_listings WHERE id = ${id};`;

    return db.execute(sql);
  }
}

module.exports = CarousellListing;
