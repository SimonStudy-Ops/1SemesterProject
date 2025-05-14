// Width and height of SVG
const w = 700;
const h = 400;
// Padding for the bars and around the charts, so there is spacing between them
const padding = 60;
// Loads the data from the API endpoint trade. 
d3.json("/api/eggconsumption").then(data => {
    // ensures that the columns "year" and "amount" is recieved as numbers.
    data.forEach(d => {
        d.year = +d.year;
        d.kilograms = +d.kilograms;
    });

    console.log("Fetched data from API:", data);

    // Chooses year from the data. data.map goes through the year column and inserts all the data into an array.
    // "new Set(...)" is a datastructure in JS that only saves unique values. "new Set(data.map(...))" removes any duplicates.
    // data is then inserted back into the array
    // ".sort" sorts the years in ascending order
    const years = [...new Set(data.map(d=> d.year))].sort((a, b) => a - b);

    console.log("Years array:", years);

// Creates a dropdown menu that allows the user to choose which year is displayed in the graph
const dropdown = d3.select ("#yearDropdown2")
//Tells d3 to tie data to "option" elements
dropdown.selectAll("option")
//Uses the array "years" as data
.data(years)
// Takes every year and creates an "option" element for it
.enter()
.append("option")
// Sets the "value" attribute for each "option" of that specific year
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

// a function that is given a parameter for a specific year and visualises the data
function updateCharts(year) {
// Filters the data in the array to only include records where "year" matches the provided input
const yearData = data
    .filter(d => d.year === year)
    .sort((a, b) => b.kilograms - a.kilograms)       // Sort by consumption - descending
    .slice(0, 10); // chooses the top 10 biggest consumers of eggs


// Scale for bubble size (egg size)
// The square-root scale makes sure that the bubbles grow proportionally with their value
        const rScale = d3.scaleSqrt()
            //The scale of the eggs needs to be between 0 and the biggest value in the kilograms column
            .domain([0, d3.max(data, d => d.kilograms)])  
            //Setting a range in pixels for the radius of the circles
            .range([10, 50]); 

        // Run force simulation to spread out bubbles - so they dont overlap and is placed at the middle
        const simulation = d3.forceSimulation(yearData)
            //pushes the bubbles towards the middle of the x-axis (w/2) with low force to spread them a bit (strength = 0.05)
            .force("x", d3.forceX(w / 2).strength(0.05))
            //pushes the bubbles towards the middle of the y-axis (h/2), again with low force
            .force("y", d3.forceY(h / 2).strength(0.05))
            //makes sure that the bubbles dont collide with each other - calculates their radius to determine the space needed + 2px padding to add some space between them
            .force("collision", d3.forceCollide(d => rScale(d.kilograms) + 2))
            .stop();

        // Run simulation manually so we can use the x/y positions - the bubbles needs to know where to go - to ensure that they dont start in the wrong spot or moves strangely
        for (let i = 0; i < 120; i++) simulation.tick();

        // Selects the svg element in the DOM 
        const svg = d3.select("#egg-bubble-chart");

        // Selects all the elements with the class .egg-group in the svg-element 
        const nodes = svg.selectAll(".egg-group")
        //Binds the yearData to this class and uses the countries as a key-function to identify each element
            .data(yearData, d => d.country); 

        // EXIT old bubbles - removes the bubbles that are no longer in top 10
        nodes.exit()
            .transition()
            .duration(500)
            .attr("transform", `translate(${w / 2}, ${h + 100})`) // move out of view (fall down)
            .style("opacity", 0) // the bubbles gradually fades away
            .remove(); //after the transition, they are removed

        // ENTER new bubbles (new top 10)
        //for each new data element a svg-group g is added
        const newGroups = nodes.enter()
            .append("g")
            //adds egg-group as class to these elements
            .attr("class", "egg-group")
            //The new bubbles starts at the top out of the visible area
            .attr("transform", `translate(${w / 2}, ${- 100})`) 
            //They start out as invisible and fades in
            .style("opacity", 0);

        // Add ellipse to each group (egg shape)
        newGroups.append("ellipse")
            .attr("rx", 0) // Initial horizontal radius (0 so it starts invisible)
            .attr("ry", 0) // Initial vertical radius (0 so it starts invisible)
            .style("fill", "yellow");

        // Add country name-label inside each bubble
        newGroups.append("text")
        //the text is the country name
            .text(d => d.country)
            //aligns the text with the middle of the bubble
            .attr("text-anchor", "middle")
            //places the text under its baseline - so it looks more centered
            .attr("dy", ".35em")
            //makes sure that the text doesnt interfere with mouse interaction
            .style("pointer-events", "none")
            .style("fill", "white")
            .style("font-size", "10px");

        // Animate new bubbles to their final position (fall into the chart)
        newGroups.transition()
            .duration(1000)
            .delay(300)
            //moves the bubbles to the final destination, which were calculated in the force simulation
            .attr("transform", d => `translate(${d.x}, ${d.y})`) 
            //Fades the circles in and makes them visible
            .style("opacity", 1);

        // Animate ellipse size (egg shape size)
        newGroups.select("ellipse")
            .transition()
            .duration(1000)
            //sets the horizontal radius to the scale based of kilograms
            .attr("rx", d => rScale(d.kilograms)) 
            //vertical radius is the same scale multiplicated by 1.3 to stretch the ellipse to look like an egg        
            .attr("ry", d => rScale(d.kilograms) * 1.3);   

        // UPDATE existing bubbles
        nodes.transition()
            .duration(1000)
            //The bubbles that stays in the top 10, whe  the new year is choosen is relocated
            .attr("transform", d => `translate(${d.x}, ${d.y})`);

        // Resizing the existing bubbles (resize to new size)
        nodes.select("ellipse")
            .transition()
            .duration(1000)
            //sets the horizontal radius to the scale based of kilograms
            .attr("rx", d => rScale(d.kilograms))        
            //vertical radius is the same scale multiplicated by 1.3 to stretch the ellipse to look like an egg     
            .attr("ry", d => rScale(d.kilograms) * 1.3);    
    }
});