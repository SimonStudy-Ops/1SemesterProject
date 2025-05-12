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

dropdown.on("change", function() {
    const selectedYear = +this.value;
    updateCharts(selectedYear);
}
);

const svg = d3
.select