import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

const width = 1100;
const height = 505;

const svg = d3.select("#worldmap svg")
  .attr("width", width)
  .attr("height", height);

// Projektion centreret på Europa
const projection = d3.geoMercator()
  .center([15, 50])        // Europa (breddegrad, længdegrad)
  .scale(700)              // Zoom ind så Europa fylder
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

const g = svg.append("g");

const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on("zoom", (event) => {
    g.attr("transform", event.transform);
  });

svg.call(zoom);

let active = null;

d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(worldData => {
  const countries = feature(worldData, worldData.objects.countries).features;

  g.selectAll("path")
    .data(countries)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "#cce")
    .attr("stroke", "#333")
    .on("click", function(event, d) {
      if (active === d) {
        active = null;
        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);
      } else {
        active = d;
        const [[x0, y0], [x1, y1]] = path.bounds(d);
        const dx = x1 - x0;
        const dy = y1 - y0;
        const x = (x0 + x1) / 2;
        const y = (y0 + y1) / 2;
        const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
        const translate = [width / 2 - scale * x, height / 2 - scale * y];

        svg.transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
          );
      }
    });
});
