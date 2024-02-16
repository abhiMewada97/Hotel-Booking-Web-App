const express = require("express");
const router = express.Router();      // create router object
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middelware.js");

// Index Route
router.get("/", wrapAsync( async (req,res) =>{     //replace all app. --by-- router. // replace all "/listings" --by-- "/"
    let allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

// New Route
router.get("/new", isLoggedIn, (req,res)=> {
    res.render("listings/new.ejs");
});

// Show Route
router.get("/:id", wrapAsync( async (req,res) =>{
    let {id} = req.params;

    // const listing = await Listing.findById(id)                // here we are populating listing
    //                             .populate("reviews")          // listing ko populate karne ke sath sath authour ko bhi populate karege for each review -> for that we use nested populate
    //                             .populate("owner");           // nested populate means populating all reviews and their owner
    
    const listing = await Listing.findById(id)
                                .populate({
                                    path: "reviews",
                                    populate: {
                                        path: "auther",
                                    },            // here we populate authore with reviews // so for that we pass opbect in first populate and first parameter is "path"
                                })                // path me all review will come // and har ek review ke liye path me author aa jaye
                                .populate("owner");
    if(!listing) {
        req.flash("error","Listing you requested for, does not exit");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}));

// Create Route
router.post("/", isLoggedIn,
    validateListing, 
    wrapAsync(async (req,res,next) =>{

        // let {title,description,price,location,country} = req.body;
        // let listing = req.body.listing;

        const newListing = new Listing(req.body.listing);
        console.log(req.user);
        newListing.owner = req.user._id;     // we are saving information of current user inside,  owner inside newListing 
                                            // how to save info --> we know req object ke ander passport by default user related information store karta hai inside req.user and it has many diff diff value
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    })
);

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync( async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error","Listing you requested for, does not exit");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));

// Update Route
router.put("/:id", isLoggedIn, 
    isOwner,
    validateListing,
    wrapAsync( async (req,res) =>{

    let {id} = req.params;

    await Listing.findByIdAndUpdate(id,{...req.body.listing});  // {...req.body.listing} js object which have all parameter and convert it into seperated value
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync( async (req,res)=>{
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);  // when findByIdAndDelete call, so as a middleware listingSchema.post will inside listing.js
    console.log(deleteListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;