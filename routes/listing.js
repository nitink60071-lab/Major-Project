const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,  
        upload.single("listing[image]"),
        validateListing,
        wrapAsync (listingController.createListing)
    );


router.get("/api/search", async (req, res) => {
    let { q } = req.query;
    if(!q || q.trim() === "") {
        let allListings = await Listing.find();
        return res.json(allListings);
    }
    let allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
        ]
    });
    res.json(allListings);
});

//router.get("/search", async(req, res) => {
//    let { q } = req.query;
//    let allListings = await Listing.find({
//        $or: [
//            { title: { $regex: q, $options: "i" } },
//            { location: { $regex: q, $options: "i" } },
//            { country: { $regex: q, $options: "i" } },
//        ]
//    });
//    res.render("listings/index", { allListings });
//});


//router.get("/check", async (req, res) => {
//    let data = await Listing.find();
//    res.send(data);
//});


//Options Route =>
router.get("/category/:category", async (req, res) => {
    let { category } = req.params;

    let allListings = await Listing.find({ category });
    
    //res.send(allListings);
    res.render("listings/index", { allListings });
});


//New Route =>
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put( 
    isLoggedIn, 
    isOwner, 
    upload.single("listing[image]"),
    validateListing, 
    wrapAsync(listingController.updateListing)
    )
    .delete(
    isLoggedIn, 
    isOwner, 
    wrapAsync(listingController.destroyListing)
);


//Edit Route => 
router.get("/:id/edit", 
    isLoggedIn, 
    isOwner, 
    wrapAsync(listingController.renderEditForm)
);

module.exports = router;