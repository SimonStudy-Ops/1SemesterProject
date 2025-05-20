import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

const w2 = 1100;
const h2 = 505;

const svg = d3.select("#worldmap svg")
  .attr("width", w2)
  .attr("height", h2);

// Projektion centreret på Europa
const projection = d3.geoMercator()
  .center([15, 50])        // Europa (breddegrad, længdegrad)
  .scale(700)              // Zoom ind så Europa fylder
  .translate([w2 / 2, h2 / 2]);

<<<<<<< HEAD
json('https://unpkg.com/world-atlas@1.1.4/world/110m.json')
  .then(data => {
    const countries = feature(data, data.objects.countries);
    svg.selectAll('path.country')
      .data(countries.features)
      .enter().append('path')
        .attr('class', 'country')
        .attr('d', pathGenerator);
=======
const path = d3.geoPath().projection(projection);
>>>>>>> 49659017ab7fea62cd5efdd6765e74c11e6cd823

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
        const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / w2, dy / h2)));
        const translate = [w2 / 2 - scale * x, h2 / 2 - scale * y];

        svg.transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
          );
      }
    });
});
