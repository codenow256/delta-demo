const Listing = require("../models/listing.js")

module.exports.index = async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};
module.exports.renderNewForm = (req,res)=>{   
    res.render("listings/new.ejs");
};
module.exports.showListing = async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id).
    populate({path:"reviews",populate:{path:"author",},}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for doesnt exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
    console.log("📦 Listing geometry:", listing.geometry);

};

module.exports.createListing = async (req, res) => {
  try {
    let url = req.file.path;
    let filename = req.file.filename;

    // Get location string from form
    const location = req.body.listing.location;

    // Call geocoding API to get coordinates
    const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const geoData = await geoResponse.json();

    if (!geoData.length) {
      req.flash("error", "Could not find location coordinates.");
      return res.redirect("/listings/new");
    }

    // Build geometry object from geocoding response
    const geometry = {
      type: "Point",
      coordinates: [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)]
    };

    // Create new listing and assign geometry
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = geometry;

    await newListing.save();

    req.flash("success", "New listing created!");
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
        if(!listing){
        req.flash("error","Listing you requested for doesnt exist");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if (typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image =  {url,filename};
    await listing.save();
    }
    req.flash("success","Listing updated!");
    res.redirect(`/listings/${id}`); // ✅ fixed
};
module.exports.destroyListing = async (req,res)=>{
     let {id}=req.params;
     let deletedListing = await Listing.findByIdAndDelete(id);
     console.log(deletedListing);
         req.flash("success","Listing deleted!");
     res.redirect("/listings");
};