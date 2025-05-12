// Width and height of SVG
const w = 1000;
const h = 500;
// Padding for the bars, so there is spacing between them
const p = 10;
// Loads the cvs file from the folder, into d3. 
// AutoType automatically sorts konverts the data to the desired types.
// Year and amount becomes numbers and the rest becomes strings
d3.csv("db/eu-import-export.csv"), d3.AutoType.then(data => {
    // Chooses year from the csv file. data.map goes through the year column and inserts all the data into an array.
    // "new Set(...)" is a datastructure in JS that only saves unique values. "new Set(data.map(...))" removes any duplicates.
    // data is then inserted back into the array
    // ".sort" sorts the years in ascending order
    const years = [...new Set(data.map(d=> d.year))].sort((a, b) => a - b);
}
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
}
);
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

const svg = d3
.select