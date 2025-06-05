const { findById } = require("./models/reviews");
const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");


module.exports.isLoggedIn = (req,res,next) =>{
     if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in !");
        return res.redirect("/login");
    }
    next();
};


/*
Redirects the user to the /login page.

Returns immediately, stopping any further execution.
This ensures that after redirecting, the function exits and next() is not called.
If the user is logged in, it calls next() to proceed to the next middleware or route handler.

🤔 Why not use next(err) here?
Because this is not an error in the application logic — the user simply isn't logged in. It’s a controlled flow (access control), not a system failure. So:

We don’t want to trigger the Express error handler.

We just redirect the user to login — a normal UX behavior.
*/ 

module.exports.saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};
/*Here’s the full redirect logic across the app:
User tries to visit a protected page, e.g., /listings/123/edit.
isLoggedIn blocks them:
Saves /listings/123/edit to req.session.redirectUrl
Redirects to /login
On the POST /login route:
saveRedirectUrl runs:
Pulls redirectUrl from session to res.locals.redirectUrl
Deletes it from session
passport.authenticate runs (logs them in)
Success handler runs:
Redirects to res.locals.redirectUrl || "/listings" */
module.exports.isOwner = async (req,res,next) =>{
    let {id}= req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
module.exports.validateListing=(req,res,next)=>{
     let {error} = listingSchema.validate(req.body);
         if(error){
            let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.validateReview=(req,res,next)=>{
     let {error} = reviewSchema.validate(req.body);
         if(error){
            let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};
module.exports.isReviewAuthor = async (req,res,next) =>{
    let {id,reviewId}= req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};