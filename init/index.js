/*
Your index.js here is a database seeding script — its only job is to:
Connect to MongoDB
Clear existing data in the Listing collection
Insert initial demo/sample data (initData.data)
📌 It's not meant to run the Express server or handle routes like app.js does.
*/const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main().
  then(()=>{
    console.log("connected to DB");
  })
  .catch((err)=>{
    console.log(err);
  });

async function main(){
    await mongoose.connect(MONGO_URL);
}
const initDB = async ()=> {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"68369067a17f9bd4830d7b5b"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
initDB();