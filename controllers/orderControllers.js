const CarousellOrder = require("../apis/order");

exports.createNewOrder = async (req, res, next) => {
  try {
    let shopifyOrderPayload = req.body;
    console.log(shopifyOrderPayload);
    
    let carousellOrder = new CarousellOrder(shopifyOrderPayload);
    
    carousellOrder = await carousellOrder.markProductsAsReserved();
    
    console.log('product(s) on order reserved')
    res.status(200).json({ message: "Order created" });
  } catch (error) {
    next(error);
  }
};
