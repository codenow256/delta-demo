if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
//const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
//const {listingSchema,reviewSchema}=require("./schema.js");
//const Review = require("./models/reviews.js")
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


//const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
main().
  then(()=>{
    console.log("connected to DB");
  })
  .catch((err)=>{
    console.log(err);
  });

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));
app.use((req, res, next) => {
    console.log("➡️  Incoming request:", req.method, req.url);
    next();
});

const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24 * 3600,//Lazy Update
});

store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE");
});

const sessionOptions = {
  store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
      expires:Date.now()+7*24*60*60*1000,
      maxAge:7*24*60*60*1000,
      httpOnly:true,
    }
} ;

app.use(session(sessionOptions)) ;
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
})
/*app.get("/demouser",async(req,res)=>{
  let fakeUser = new User({
    email:"charu@gmail.com",
    username:"charu",
  });
  let registeredUser = await User.register(fakeUser,"abc");
  res.send(registeredUser);
});*/

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

/*app.get("/testListing",async(req,res)=>{
       let sampleListing = new Listing({
        title:"My new Villa",
        description:"By the beach",
        price:12000,
        location:"Calanda,Goa",
        country:"India",
       });
 
        await sampleListing.save();
        console.log("sample was saved");
        res.send("successful testing");
});*/

app.get("/", async (req, res, next) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  } catch (err) {
    next(err); // send to error handler
  }
});

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found!"));
});
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
    //res.status(statusCode).send(message);
});
app.listen(3000,()=>{
    console.log("server is listening on port 3000");
});