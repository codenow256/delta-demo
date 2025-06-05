const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); // adjust path as needed

// Connect to your MongoDB
mongoose.connect("mongodb://localhost:27017/wanderlust", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async function () {
  console.log("Database connected");

  try {
    // Find listings with missing or empty geometry coordinates
    const listings = await Listing.find({
      $or: [
        { geometry: { $exists: false } },
        { "geometry.coordinates": { $size: 0 } },
        { geometry: null }
      ],
    });

    console.log(`Found ${listings.length} listings to update.`);

    for (const listing of listings) {
      const location = listing.location;
      console.log(`Fetching coordinates for: ${location}`);

      if (!location) {
        console.log(`Skipping listing ${listing._id} as location is missing.`);
        continue;
      }

      // Call geocoding API
      const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const geoData = await geoResponse.json();

      if (!geoData.length) {
        console.log(`No coordinates found for location: ${location}`);
        continue;
      }

      // Update geometry
      listing.geometry = {
        type: "Point",
        coordinates: [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)],
      };

      await listing.save();
      console.log(`Updated listing ${listing._id} with coordinates: ${listing.geometry.coordinates}`);
    }
  } catch (err) {
    console.error("Error updating listings:", err);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
});
/*
| Line                                                 | What It Does                                                                           |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `require(...)`                                       | Brings in Mongoose, your Listing model, and `node-fetch`.                              |
| `fetch = (...) => import(...)`                       | A workaround to use `node-fetch` in ES module format inside CommonJS.                  |
| `mongoose.connect(...)`                              | Connects to your local MongoDB.                                                        |
| `Listing.find({ geometry: { $exists: false } })`     | Finds all listings that **don’t** have `geometry`.                                     |
| `for (let listing of listings)`                      | Loops through each listing.                                                            |
| `geoResponse = await fetch(...)`                     | Calls OpenStreetMap’s **geocoding API** to get coordinates for the listing's location. |
| `geoData = await geoResponse.json()`                 | Parses the JSON response into usable data.                                             |
| `if (!geoData.length)`                               | If no data found, skips to the next listing.                                           |
| `geometry = { type: "Point", coordinates: [...] }`   | Builds a GeoJSON-like object.                                                          |
| `listing.geometry = geometry; await listing.save();` | Updates and saves the listing.                                                         |
| `mongoose.connection.close();`                       | Disconnects from DB after done.                                                        |
*/ 