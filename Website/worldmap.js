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

d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(worldData => {
  const countries = feature(worldData, worldData.objects.countries).features;

  g.selectAll("path")
    .data(countries)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "#4CAF50")
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

        infoBox.style("display", "block")
          .html(`<strong>Land:</strong> ${d.properties ? d.properties.name : "Ukendt"}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px");
      }
    });
});
