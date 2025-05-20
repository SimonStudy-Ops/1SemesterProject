import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

const w2 = 1100;
const h2 = 505;

const svg = d3.select("#worldmap svg")
  .attr("width", w2)
  .attr("height", h2);

const projection = d3.geoMercator()
  .center([15, 50])        
  .scale(700)             
  .translate([w2 / 2, h2 / 2]);

const path = d3.geoPath().projection(projection);

const g = svg.append("g");

const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on("zoom", (event) => {
    g.attr("transform", event.transform);
  });

svg.call(zoom);

let active = null;

const infoBox = d3.select("#worldmap")
  .append("div")
  .attr("id", "infoBox")
  .style("position", "absolute")
  .style("background", "white")
  .style("padding", "10px")
  .style("border", "1px solid #333")
  .style("border-radius", "5px")
  .style("pointer-events", "none")
  .style("display", "none");  

// Create year dropdown
const yearDropdown = d3.select("#chickenYearDropdown");
const years = d3.range(2000, 2024);
yearDropdown.selectAll("option")
  .data(years)
  .enter()
  .append("option")
  .attr("value", d => d)
  .text(d => d);
let selectedYear = 2023;

// Load both world map and chicken data
Promise.all([
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
  d3.json("/api/howManyChickensEU") // Adjust path if needed
]).then(([worldData, chickenData]) => {
  console.log("Chicken Data:", chickenData);
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

  // Get all possible values for scale
  function getAllValuesForYear(year) {
    return chickenData
      .filter(d => +d.year === +year)
      .map(d => +d.value);
  }

  function updateMapColors(year) {
    // Compute color scale for this year
    const values = getAllValuesForYear(year);
    const minValue = d3.min(values);
    const maxValue = d3.max(values);

    const colorScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range(["#d7e3fc", "#0a225d"]); // light blue to dark blue

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
        if (active === d) {
          active = null;
          svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);

          infoBox.style("display", "none");  
        } else {
          active = d;
          const [[x0, y0], [x1, y1]] = path.bounds(d);
          const dx = x1 - x0;
          const dy = y1 - y0;
          const x = (x0 + x1) / 2;
          const y = (y0 + y1) / 2;
          const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / w2, dy / h2)));
          const translate = [w2 / 2 - scale * x, h2 / 2 - scale * y];

          svg.transition()
            .duration(750)
            .call(
              zoom.transform,
              d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );

          const countryName = d.properties ? d.properties.name : null;
          const value = getChickenValue(countryName, year);
          if (!value) {
            console.log("No value for", countryName);
        }
          infoBox.style("display", "block")
            .html(`<strong>Land:</strong> ${countryName}<br>
                   <strong>Chickens (per 1000):</strong> ${value !== null ? value : "N/A"}<br>
                   <strong>Year:</strong> ${year}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px");
        }
      });
  }

  // Initial map coloring
  updateMapColors(selectedYear);

  // Listen for year changes
  yearDropdown.on("change", function() {
    selectedYear = +this.value;
    updateMapColors(selectedYear);
    infoBox.style("display", "none");
  });
});