document.addEventListener("DOMContentLoaded", () => {
  const mapDiv = document.getElementById("map");
  if (!mapDiv) return console.error("Map container not found");

  // Read data attributes
  const lat = parseFloat(mapDiv.dataset.lat);
  const lng = parseFloat(mapDiv.dataset.lng);
  const title = mapDiv.dataset.title || "Location";

  if (isNaN(lat) || isNaN(lng)) {
    console.error("Invalid latitude or longitude");
    return;
  }

  // Initialize the map centered at given coords with zoom level 13
  const map = L.map("map").setView([lat, lng], 13);

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Add a marker at the location with popup showing the title
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<b>${title}</b>`)
    .openPopup();
});
/*
| Line                                             | What It Does                                                     |         |                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------- | ------- | ------------------------------------------------------ |
| `console.log("map.js loaded");`                  | Helps confirm the script is running.                             |         |                                                        |
| `document.addEventListener(...)`                 | Waits until HTML is fully loaded before running JS.              |         |                                                        |
| `const mapDiv = document.getElementById("map");` | Finds the `<div id="map">` element in your HTML.                 |         |                                                        |
| `if (!mapDiv) return`                            | If that div isn't found, stop and show an error.                 |         |                                                        |
| `mapDiv.dataset.lat/lng/title`                   | These read values like `<div data-lat="28.6" ...>` from the DOM. |         |                                                        |
| `parseFloat(...)`                                | Converts string values like `"28.6"` to numbers.                 |         |                                                        |
| \`if (!lat                                       |                                                                  | !lng)\` | Prevents errors if coordinates are missing or invalid. |
| `L.map("map").setView(...)`                      | Creates a Leaflet map centered at the listing’s coordinates.     |         |                                                        |
| `L.tileLayer(...)`                               | Adds the visible map layer (OpenStreetMap tiles).                |         |                                                        |
| `L.marker(...).bindPopup(...)`                   | Drops a marker on the map with a popup showing the title.        |         |                                                        |
*/