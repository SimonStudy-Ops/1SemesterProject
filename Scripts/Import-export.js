// Width and height of SVG
const w = 1000;
const h = 500;
// Padding for the bars, so there is spacing between them
const padding = 10;
// Loads the cvs file from the folder, into d3. 
// AutoType automatically sorts konverts the data to the desired types.
// Year and amount becomes numbers and the rest becomes strings
d3.csv("db/eu-import-export.csv"), d3.AutoType.then(data => {
    // Chooses year from the csv file. data.map goes through the year column and inserts all the data into an array.
    // "new Set(...)" is a datastructure in JS that only saves unique values. "new Set(data.map(...))" removes any duplicates.
    // data is then inserted back into the array
    // ".sort" sorts the years in ascending order
    const years = [...new Set(data.map(d=> d.year))].sort((a, b) => a - b);

// Creates a dropdown menu that allows the user to choose which year is displayed in the graph
const dropdown = d3.select ("body")
.insert("select", "first-child")
.attr("id", "yearDropdown");
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
// Sets an event listener(an event listener is a function that waits for a specific event to occur and executes code in respone), that reacts when the dropdown menu changes
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
const yearData = data.filter(d => d.year === year);
// spilts the data for years into two arrays
const importData = yearData.filter(d => d.type === "Import");
const exportData = yearData.filter(d => d.type === "Export");
// Sorts the dataset in descending order based on the amount. ".slice" chooses the top five countries by import and export
const topImport = importData.sort((a, b)=>b.amount - a.amount).slice(0,5);
const topExport = exportData.sort((a, b)=>b.amount - a.amount).slice(0,5);

// drawBarChart is called to place the chart in the element with the corrosponding ID
// takes the constant "Topimport" and "TopExport" to visualize the chart
// The third argument (tons) labels the y-axis
drawBarChart("#importContainer", topImport, "Import (tons)");
drawBarChart("#exportContainer", topImport, "Export (tons)");
}

// Calls to "drawBarchart" function, and the arguments in it
function drawBarChart(containerId, chartData, yLabel) {
// Selects existing svg element inside container and removes it. Prevents multiple charts from stacking on each other
d3.select(containerId).select("svg").remove();
// creates svg element inside the specific container
// sets the dimensions to the predefined w and h for width and height respectively
const svg = d3.select(containerId)
.append("svg")
.attr("width", w)
.attr("height", h);

// Uses d3.scaleBand for categorical data
const xScale = d3.scaleBand()
// "domain" sets the input data as countries on the x-axis
.domain(chartData.map(d => d.country))
// Sets the range of positions for the bar on the x-axis
.range([padding, w - padding])
// adds space between the bars
.padding(0.2);

//Uses scaleLinear for numbers
const yScale = d3.scaleLinear()
// "domain" sets the input data as amount on the y-axis. The input range goes from 0 to the biggest number in chartData
.domain([0, d3.max(chartData, d => d.amount)])
//  Uses the svg's coordinate system to map the bars. Leaves room at the top and bottom of the y-axis
.range([h - padding, padding])
// Rounds to "nice" numbers for a prettier axis
.nice();

// creates an element called "g". "g" holds the x-axis
svg.append("g")
// Moves the x-avis to the bottom of the chart, but padding moves it up
.attr("transform", `translate(0, ${h - padding})`) // adds a value into a string
// Tells d3 to generate bottom oriented axis using xScale
.call(d3.axisBottom(xScale))
.selectAll("text")
// Selects the text and rotates it 45 degress withing the bar
.attr("transform", "rotate(-45)")
// Lines up the rotated text so it aligns with the end of each bar
.style("text-anchor", "end");

// Adds another group for y-axis
svg.append("g")
// Moves the y-axis to the left side of the chart after the padding
.attr("transform", `translate(${padding}, 0)`)
// Draws a left-oriented axis using the yScale - makes the ticks
.call(d3.axisLeft(yScale));

//Adds "text" to the y-axis
svg.append("text")
//Positions label near the left side
.attr("x", padding)
//Moves the labels 10 pixels over each tick
.attr("y", padding - 10)
// aligns the text from starting point
.style("text-anchor", "start")
.text(yLabel);

// Placeholder for "bars"
svg.selectAll("rect")
// Binds data to the selection
.data(chartData)
// Creates new bars for each new data point
.enter()
// Adds one rect (rectangle) per data point
.append("rect")
// Sets the horizontal  left position of the bar. xScale converts country name into an x position
.attr("x", d => xScale(d.country))
// Sets the top edge of the bar. Turns amount into vertical position
.attr("y", d => yScale(d.amount))
// Sets how wide each bar is. xScale.bandwidth calculates the spacing for each bar
.attr("width", xScale.bandwidth())
// height of the bar
.attr("height", d => h - padding - yScale(d.amount))
// Colours the bar blue
.attr("fill", "steelblue");
}
});