const db = require("../config/db");

class ShopifyListing {
  constructor(productId, productTitle, productSku) {
    this.productId = productId;
    this.productTitle = productTitle;
    this.productSku = productSku;
  }

  save() {
    let d = new Date();
    let yyyy = d.getFullYear();
    let mm = d.getMonth() + 1;
    let dd = d.getDate();

    let createdAtDate = `${yyyy}-${mm}-${dd}`;

    let sql = `
    INSERT INTO shopify_listings(
      product_id,
      product_title,
      product_sku,
      created_at
    )
    VALUES(
      '${this.productId}',
      '${this.productTitle}',
      '${this.productSku}',
      '${createdAtDate}'
    )
    `;

    return db.execute(sql);
  }

  static getCarousellId(shopifyProductId) {
    let sql = `
    SELECT carousell_listings.id
    FROM shopify_listings 
    INNER JOIN carousell_listings
    ON shopify_listings.product_id = carousell_listings.shopify_product_id
    WHERE shopify_listings.product_id = ${shopifyProductId};`;

    return db.execute(sql);
  }

  static findById(shopifyProductId) {
    let sql = `SELECT * FROM shopify_listings WHERE product_id = ${shopifyProductId};`;

    return db.execute(sql);
  }
}

module.exports = ShopifyListing;
