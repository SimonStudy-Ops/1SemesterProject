// Width and height of SVG
const width = 500;
const height = 400;

const tooltip = d3.select("#tooltip");

// Loads the data from the API endpoint eggconsumption. 
d3.json("/api/eggconsumption").then(data => {
    // ensures that the columns "year" and "kilograms" is recieved as numbers.
    data.forEach(d => {
        d.year = +d.year;
        d.kilograms = +d.kilograms;
    });
 //making sure that the data is retrieved correct (logs the data in the console)
    console.log("Fetched data from API:", data);

    // Chooses year from the data. data.map goes through the year column and inserts all the data into an array.
    // "new Set(...)" is a datastructure in JS that only saves unique values. "new Set(data.map(...))" removes any duplicates.
    // data is then inserted back into the array
    // ".sort" sorts the years in ascending order
    const years = [...new Set(data.map(d=> d.year))].sort((a, b) => a - b);

    //logging the years array, to make sure it is correct
    console.log("Years array:", years);

// Creates a dropdown menu that allows the user to choose which year is displayed in the chart
const dropdown = d3.select ("#yearDropdown2")
//Tells d3 to tie data to "option" element
dropdown.selectAll("option")
//Uses the array "years" as data
.data(years)
// Takes every year and creates an "option" element for it
.enter()
.append("option")
// Sets the "value" attribute for each "option" to that specific year
.attr("value", d => d)
// Makes the visible text in the "option" element into the specific year
.text(d => d);

// initializes the first year
updateCharts(years[0]);
// Sets an event listener(an event listener is a function that waits for a specific event to occur 
// and executes code in respone), that reacts when the dropdown menu changes
dropdown.on("change", function() {
    // this.value gives the chosen value in the dropdown a year as a string.
    // +this.value turns this string in the dropdown menu into an integer
    const selectedYear = +this.value;
    // Calls to the function that updates the graphs so it shows the chosen year
    updateCharts(selectedYear);
});

// a function called updateCharts, that is given a parameter for a specific year and visualises the data
function updateCharts(year) {
// Filters the data in the array to only include records where "year" matches the provided input, that is given when choosing which option/year
const yearData = data
    .filter(d => d.year === year)
    .sort((a, b) => b.kilograms - a.kilograms)       // Sort by consumption - in descending order
    .slice(0, 10); // chooses the top 10 biggest consumers of eggs

//editing the color for the eggs - the bigger the amount in kilograms the darker the color
const colorScale = d3.scaleLinear()
  .domain([0, 9]) // top 10: index 0 to 9
  .range(["#d7a86e", "#fff0d0"]); // dark to lighter egg color

// Scale for bubble size (egg size)
// The square-root scale makes sure that the bubbles grow proportionally with their value
        const rScale = d3.scaleSqrt()
            //The scale for the eggs needs to be between 0 and the biggest value in the kilograms column
            .domain([0, d3.max(data, d => d.kilograms)])  
            //Setting a range in pixels for the radius of the circles
            .range([5, 70]); 

        // Run force simulation to spread out bubbles - so they dont overlap and is placed at the middle
        const simulation = d3.forceSimulation(yearData)
            //pushes the bubbles towards the middle of the x-axis (w/2) with low force to spread them a bit (strength = 0.05)
            .force("x", d3.forceX(width / 2).strength(0.05))
            //pushes the bubbles towards the middle of the y-axis (h/2), again with low force
            .force("y", d3.forceY(height / 2).strength(0.05))
            //makes sure that the bubbles dont collide with each other - calculates their radius to determine the space needed + 10px padding to add some space between them
            .force("collision", d3.forceCollide(d => rScale(d.kilograms) + 10))
            .stop();

        // Run simulation manually so we can use the x/y positions - the bubbles needs to know where to go - to ensure that they move to their right spot or else they would just be drawn at the left-top corner.
        for (let i = 0; i < 120; i++) simulation.tick();

        // Selects the svg element in the DOM with its ID
        const svg = d3.select("#egg-bubble-chart");

        // Selects all the elements with the class .egg-group in the svg-element - which is added further down.
        const nodes = svg.selectAll(".egg-group")
        //Binds the yearData to this class and uses the countries as a key-function to identify each element
            .data(yearData, d => d.country); 

        // Exit old bubbles - removes the bubbles that are no longer in top 10
        nodes.exit()
            .transition()
            .duration(500)
            //To insert the numbers retrived from the variables into the string, ${} is added around.
            //The bubbles exits through the middle (w/2) and moves the height down, which is at the bottom + 100px to move out of the chart.
            .attr("transform", `translate(${width / 2}, ${height + 100})`) 
            .style("opacity", 0) // the bubbles gradually fades away
            .remove(); //after the transition, they are removed

        // Enter new bubbles (new top 10)
        const newGroups = nodes.enter()
            //for each new data element a svg-group g is added - so we can alter it as we want later
            .append("g")
            //adds egg-group as class to these elements
            .attr("class", "egg-group")
            //The new bubbles starts at the top middle out of the visible area (-100px)
            .attr("transform", `translate(${width / 2}, ${- 100})`) 
            //They start out as invisible and fades in
            .style("opacity", 0);

        // Add ellipse to each data-element (to make egg shape)
        newGroups.append("ellipse")
            .attr("rx", 0) // Initial horizontal radius (0 so it starts invisible)
            .attr("ry", 0) // Initial vertical radius (0 so it starts invisible)
            //the ellipses are coloured based on their index by using colorscale
            .style("fill", (d, i) => colorScale(i))
            //Outlining the eggs with black
            .style("stroke", "black")
            .style("stroke-width", 2);

        // Add country name-label inside each bubble
        newGroups.append("text")
        //We want to know which country has the biggest consumption by looking at the name, as the size difference isnt that visible. Therefor we add a # and then take the sorted array index and adds 1, so it doesnt start with 0 (the first index) and than we add the country name to the circles.
            .text((d, i) => `#${i + 1} ${d.country}`)
            //aligns the text with the middle of the bubble
            .attr("text-anchor", "middle")
            //places the text under its baseline - so it looks more centered
            .attr("dy", ".35em")
            //makes sure that the text doesnt interfere with mouse interaction - so that the text-box still is showing when we hoover over the text
            .style("pointer-events", "none")
            //text styling
            .style("fill", "black")
            .style("font-size", "12px")
            .style("font-weight", "bold")
        

            //tooltip interaction - adds text-box when the mouse hoovers over the ellipse
        newGroups.select("ellipse")
        //The function is run (.on) when the mouse is over tihe ellipse (this function takes the parameters event - to position the tooltip and d - the data object bound to the ellipse)
        .on("mouseover", function(event, d) {
            //making the tooltip visible
            tooltip.style("display", "block")
            //sets the content in the tooltip to be dynamically according to the present data-point
                .html(`Kilograms per capita: ${d.kilograms}`)
                //positions the tooltip on the right of the mouse (event.pageX = the x coordinate of where the mouse is situated on the page)
               .style("left", (event.pageX + 10) + "px")
                //positions under the mouse (+10 because the axes are inverted)
                .style("top", (event.pageY + 10) + "px");
        })
        //New function that gets run when the mouse leaves the ellipse
        //The display of the tooltip is removed
        .on("mouseout", function() {
                tooltip.style("display", "none");
        });

        // Animate new bubbles to their final position in the chart (fall into the chart)
        newGroups.transition()
            .duration(1000)
            //adding some delay, so the old circles leave first and then the new ones move in
            .delay(300)
            //moves the bubbles to the final destination, which were calculated in the force simulation
            .attr("transform", d => `translate(${d.x}, ${d.y})`) 
            //Fades the circles in and makes them visible (full opacity)
            .style("opacity", 1);

        // Animate ellipse size (egg shape size)
        newGroups.select("ellipse")
            .transition()
            .duration(1000)
            //sets the horizontal radius to the scale based of kilograms - so the size shows the difference in the value-size
            .attr("rx", d => rScale(d.kilograms)) 
            //vertical radius is the same scale multiplicated by 1.3 to stretch the ellipse to look like an egg        
            .attr("ry", d => rScale(d.kilograms) * 1.3);   

        // Update existing bubbles
        nodes.transition()
            .duration(1000)
            //The bubbles that stays in the top 10, when the new year is choosen is relocated
            .attr("transform", d => `translate(${d.x}, ${d.y})`);

        // Resizing the existing bubbles/ellipses (resize to new size)
        nodes.select("ellipse")
            .transition()
            .duration(1000)
            //sets the horizontal radius to the scale based of kilograms
            .attr("rx", d => rScale(d.kilograms))        
            //vertical radius is the same scale multiplicated by 1.3 to stretch the ellipse to look like an egg     
            .attr("ry", d => rScale(d.kilograms) * 1.3)
            //updating the color on the existing circles - the color fades lighter the higher the index-number - that way the ones with the highest consumption is darker and more noticable
            .style("fill", (d, i) => colorScale(i));

        //updating the rank (#) label before the country name - when a new year is choosen
        nodes.select("text")
            .text((d, i) => `#${i + 1} ${d.country}`);
    }
});