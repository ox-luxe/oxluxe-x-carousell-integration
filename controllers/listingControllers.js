const CarousellStore = require("../apis/listing");

exports.createOrUpdateListing = async (req, res, next) => {
  // ignore listing updates
  if (req.shouldNotUpdateListing) {
      res.status(200).json({ message: "Listing updates received" });
      
  } else {
    // create listing
    if (req.shouldCreateListing) {
      try {
        let payload = req.body;
        let carousellStore = new CarousellStore(payload);
        await carousellStore.createListing();
        
        res.status(201).json({ message: "Listing created" });
      } catch (error) {
        next(error);
      }
    } 

    // update listing
    if (req.shouldUpdateListing) {
      try {
        let payload = req.body;
        let carousellStore = new CarousellStore(payload);
        await carousellStore.updateListing();
        
        res.status(201).json({ message: "Listing updated" });
      } catch (error) {
        next(error);
      }
    }   

    next(); // execute delete listing middleware below 
  }
};

exports.deleteListing = async (req, res, next) => {
  // delete listing. Not implemented yet. . 
  if (req.shouldDeleteListing) {
    try {    
      CarousellStore.delete(req.body.id);
      res.status(200).json({ message: "Listing deleted" });
      
    } catch (error) {
      next(error);
    }
  }
};
