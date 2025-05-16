import { select, json, geoPath, geoNaturalEarth1 } from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { feature } from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';

fetch('')
const svg = d3.select('#worldmap svg');

const projection = geoNaturalEarth1()
.center([15, 56])  // Længde, bredde – flytter fokus mod Europa
.scale(900)        // Zoomer ind
.translate([500, 200]); // Centrerer på SVG (halvdelen af width og height)
const pathGenerator = geoPath().projection(projection);

svg.append('path')
  .attr('class', 'sphere')
  .attr('d', pathGenerator({ type: 'Sphere' }));

json('https://unpkg.com/world-atlas@1.1.4/world/110m.json')
  .then(data => {
    const countries = feature(data, data.objects.countries);
    svg.selectAll('path.country')
      .data(countries.features)
      .enter().append('path')
        .attr('class', 'country')
        .attr('d', pathGenerator);
      

  });