const mongoose = require("mongoose");
const Review = require("./reviews.js");
const { ref } = require("joi");

const listingSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
 /*image: {
    type: String,
    default: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2t5JTIwdmFjYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    set: (v) =>
      v === ""
         ?"https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2t5JTIwdmFjYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
         : v
  },*/
  image:{
    url:String,
    filename:String,
  },
    price:Number,
    location:String,
    country:String,
    reviews:[
      {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Review",
    },
  ],
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
  },
   geometry : {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    }
  },
  category:{
    type:String,
    enum:["trending","rooms","iconic cities","mountains","castles","pools","arctic","farms","camping","boats","domes"],
  }
});
listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
  await Review.deleteMany({_id:{$in:listing.reviews}});
  }
});


const Listing=mongoose.model("Listing",listingSchema);
module.exports = Listing;