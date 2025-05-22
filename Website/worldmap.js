import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";
//width and height of the SVG
const w2 = 1100;
const h2 = 600;
//select the SVG element inside the container with id "worldmap"
const svg = d3.select("#worldmap svg")
  .attr("width", w2)
  .attr("height", h2)
  .style("background-color", "#00a5cf"); // light blue background 

//define the projection (Mercator) centered on Europe
const projection = d3.geoMercator()
  .center([15, 54]) // Center on Europe       
  .scale(700)   // Scale to fit the map          
  .translate([w2 / 2, h2 / 2]); // Translate to center of the SVG

const path = d3.geoPath().projection(projection);

// Create a group for countries
const g = svg.append("g");

// Set up zoom behavior
const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on("zoom", (event) => {
    g.attr("transform", event.transform);
  });

svg.call(zoom); // Apply zoom behavior to the SVG

let active = null; // Variable to keep track of the active country
// Create a div for the info box
const infoBox = d3.select("#worldmap")
  .append("div")
  .attr("id", "infoBox")
  .style("position", "absolute")
  .style("background", "white")
  .style("padding", "10px")
  .style("border", "1px solid #333")
  .style("border-radius", "5px")
  .style("pointer-events", "none") // Allows mouse interaction to pass through
  .style("display", "none");  // Hidden by default

// Create year dropdown
const yearDropdown = d3.select("#chickenYearDropdown");
const years = d3.range(2000, 2024);
yearDropdown.selectAll("option")
  .data(years)
  .enter()
  .append("option")
  .attr("value", d => d)
  .text(d => d);
let selectedYear = 2023; // Default year

// Load both world map and chicken data asynchronously
// Use Promise.all to wait for both data to load
Promise.all([
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
  d3.json("/api/howManyChickensEU") 
]).then(([worldData, chickenData]) => {
  console.log("Chicken Data:", chickenData);
  // Convert TopoJSON to GeoJSON features
  const countries = feature(worldData, worldData.objects.countries).features;

  // Helper: get chicken value for a country and year
  function getChickenValue(country, year) {
    // Find matching row
    const row = chickenData.find(
      d => d.country === country && +d.year === +year
    );
    console.log("Row:", row);
    return row ? +row.value : null;
  }

  // Get all chicken values for a given year
  function getAllValuesForYear(year) {
    return chickenData
      .filter(d => +d.year === +year)
      .map(d => +d.value);
  }
  //Update the map colors based on the selected year
  function updateMapColors(year) {

    const values = getAllValuesForYear(year);
    const minValue = d3.min(values);
    const maxValue = d3.max(values);

    const colorScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range(["#95d5b2", "#2d6a4f"]); // light green to dark green
    //Draw the countries and paint with the chicken data
    g.selectAll("path")
      .data(countries)
      .join("path")
      .attr("d", path)
      .attr("fill", d => {
        const countryName = d.properties ? d.properties.name : null;
        const value = getChickenValue(countryName, year);
        if (value !== null) {
          return colorScale(value);
        } else {
          return "#e0e0e0"; // default for missing data
        }
      })
      .attr("stroke", "#333")
      .on("click", function(event, d) {
        // Handle click event
        // Check if the clicked country is already active
        if (active === d) {
          active = null;
          svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);

          infoBox.style("display", "none");  
        } else {
          active = d;
          const [[x0, y0], [x1, y1]] = path.bounds(d); // Get bounds of the clicked country
          const dx = x1 - x0;
          const dy = y1 - y0;
          const x = (x0 + x1) / 2;
          const y = (y0 + y1) / 2;
          const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / w2, dy / h2)));
          const translate = [w2 / 2 - scale * x, h2 / 2 - scale * y];
          // Zoom to the selected country
          svg.transition()
            .duration(750)
            .call(
              zoom.transform,
              d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
          // Get country name and value
          const countryName = d.properties ? d.properties.name : null;
          // Get chicken value for the selected country and year
          // Check if countryName is null
          const value = getChickenValue(countryName, year);
          if (!value) {
            console.log("No value for", countryName);
        }
        // Show info box with chicken data
          infoBox.style("display", "block")
            .html(`<strong>Land:</strong> ${countryName}<br>
                   <strong>Chicken pop (per 1000):</strong> ${value !== null ? value : "N/A"}<br>
                   <strong>Year:</strong> ${year}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
        }
      });
  }

  // Initial map coloring
  updateMapColors(selectedYear);

  // Update map colors when the year is changed
  yearDropdown.on("change", function() {
    selectedYear = +this.value;
    updateMapColors(selectedYear);
    infoBox.style("display", "none");
  });
});