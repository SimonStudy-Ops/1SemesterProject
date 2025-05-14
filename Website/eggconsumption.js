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
        const rScale = d3.scaleSqrt()
            //The scale of the eggs needs to be between 0 and the biggest value in the kilograms column
            .domain([0, d3.max(data, d => d.kilograms)])  
            //Setting a range in pixels for the radius of the circles
            .range([10, 50]); 

        // Run force simulation to spread out bubbles
        const simulation = d3.forceSimulation(yearData)
            //pushes the bubbles towards the middle of the x-axis with low force to spread them a bit
            .force("x", d3.forceX(w / 2).strength(0.05))
            //pushes the bubbles towards the middle of the y-axis, again with low force
            .force("y", d3.forceY(h / 2).strength(0.05))
            //makes sure that the bubbles dont collide with each other
            .force("collision", d3.forceCollide(d => rScale(d.kilograms) + 2))
            .stop();

        // Run simulation manually so we can use the x/y positions
        for (let i = 0; i < 120; i++) simulation.tick();

        // Join data to groups (bubbles)
        const svg = d3.select("svg");

        // Selects all the elements with the class .egg-group in the svg and binds the yearData to them
        const nodes = svg.selectAll(".egg-group")
            .data(yearData, d => d.country); // Use country as a unique ID

        // EXIT old bubbles - removes the bubbles that are no longer in top 10
        nodes.exit()
            .transition()
            .duration(500)
            .attr("transform", `translate(${w / 2}, ${h + 100})`) // move out of view (fall down)
            .style("opacity", 0) // the bubbles gradually fades away
            .remove(); //after the transition, they are removed

        // ENTER new bubbles (new top 10)
        const newGroups = nodes.enter()
            .append("g")
            .attr("class", "egg-group")
            .attr("transform", `translate(${w / 2}, ${h + 100})`) // start offscreen (fall down)
            .style("opacity", 0);

        // Add ellipse to each group (egg shape)
        newGroups.append("ellipse")
            .attr("rx", 0) // Initial horizontal radius (0 so it starts invisible)
            .attr("ry", 0) // Initial vertical radius (0 so it starts invisible)
            .style("fill", "orange");

        // Add country name label inside each bubble
        newGroups.append("text")
            .text(d => d.country)
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .style("pointer-events", "none")
            .style("fill", "white")
            .style("font-size", "10px");

        // Animate new bubbles to their final position (fall into the chart)
        newGroups.transition()
            .duration(1000)
            .delay(300)
            .attr("transform", d => `translate(${d.x}, ${d.y})`) // Move to final position
            .style("opacity", 1);

        // Animate ellipse size (egg shape size)
        newGroups.select("ellipse")
            .transition()
            .duration(1000)
            .attr("rx", d => rScale(d.kilograms))           // Horizontal radius (egg shape size)
            .attr("ry", d => rScale(d.kilograms) * 1.3);    // Vertical radius (egg shape size)

        // UPDATE existing bubbles
        nodes.transition()
            .duration(1000)
            .attr("transform", d => `translate(${d.x}, ${d.y})`);

        // Animate resizing existing bubbles (resize to new size)
        nodes.select("ellipse")
            .transition()
            .duration(1000)
            .attr("rx", d => rScale(d.kilograms))           // Horizontal radius (egg shape size)
            .attr("ry", d => rScale(d.kilograms) * 1.3);    // Vertical radius (egg shape size)
    }
});