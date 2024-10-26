// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const width = 600, height = 400;
    const margin = {top:30, bottom: 50,left: 50,right:30};

    // Create the SVG container
    const svg = d3.select('#scatterplot')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'lightyellow')   
    
    // Set up scales for x and y axes
    const xScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.PetalLength) - 5, d3.max(data, d => d.PetalLength) + 5])
    .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 5, d3.max(data, d => d.PetalWidth) + 5])
        .range([height - margin.bottom, margin.top])

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);


    // Add scales     
    let yAxis = svg.append('g')
        .call(d3.axisLeft().scale(yScale))
        .attr('transform', `translate(${margin.left},0)`)

    let xAxis  = svg.append('g')
        .call(d3.axisBottom().scale(xScale))
        .attr('transform', `translate(0,${height-margin.bottom})`)    

    // Add circles for each data point
    svg.append('g')
        .selectAll("circle") 
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth)) 
        .attr("r", 3)
        .style("fill", d => colorScale(d.Species))   

    // Add x-axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 15)
        .text('Petal Length')
        .style('text-anchor', 'middle')   

    // Add y-axis label
    svg.append('text')
        .attr('x', 0 - height / 2)
        .attr('y', 25)
        .text('Petal Width')
        .attr('transform', 'rotate(-90)')
        .style('text-anchor', 'middle')    

    // Add legend
    const keys = colorScale.domain()
    svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
          .attr("cx", 450)
          .attr("cy", (d,i) => 50 + i*25) 
          .attr("r", 7)
          .style("fill", d => colorScale(d))

    svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
          .attr("x", 470)
          .attr("y", (d,i) => 50 + i*25) 
          .style("fill", d => colorScale(d))
          .text(d => d)
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")

    

});

iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
    });

    // Define the dimensions and margins for the SVG
    const width = 600, height = 400;
    const margin = {top:30, bottom: 50, left: 50, right:30};

    // Create the SVG container
    const svg = d3.select('#boxplot')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'lightyellow')

    // Set up scales for x and y axes
    let xScale = d3.scaleBand()
              .domain(data.map(d => d.Species))
              .range([margin.left, width - margin.right])
              .padding(0.5);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.PetalLength)])
        .range([height - margin.bottom, margin.top])
    
    // Add scales 
    let yAxis = svg.append('g')
            .call(d3.axisLeft().scale(yScale))
            .attr('transform', `translate(${margin.left},0)`)

    let xAxis  = svg.append('g')
        .call(d3.axisBottom().scale(xScale))
        .attr('transform', `translate(0,${height-margin.bottom})`)

    // Add x-axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 15)
        .text('Species')
        .style('text-anchor', 'middle')

    // Add y-axis label
    svg.append('text')
        .attr('x', 0 - height / 2)
        .attr('y', 25)
        .text('Petal Length')
        .attr('transform', 'rotate(-90)')
        .style('text-anchor', 'middle')

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending)
        const q1 = d3.quantile(values, 0.25)
        const median = d3.quantile(values, 0.5)
        const q3 = d3.quantile(values, 0.75)
        const interquartilerange = q3 - q1
        const min = q1 - 1.5 * interquartilerange
        const max = q3 + 1.5 * interquartilerange
        return { q1, median, q3, interquartilerange, min, max}
    };

    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);
    // Answer: This line of code applies the roll up function by grouping the data for each key such that the output
    // calculates the statistics of the q1, median, q3, interquartilerange, min, and max returns of Petal Length data for each unique species. This
    // then helps up to map out and draw the boxplot using the necessary data points of each specified group

    const colorScale = d3.scaleOrdinal()
        .domain([...quartilesBySpecies.keys()])
        .range(d3.schemeCategory10);

    quartilesBySpecies.forEach((quartiles, Species) => {
        const x = xScale(Species);
        const boxWidth = xScale.bandwidth();
    // Answer: In this code, we are using the previous defined variable quartilesBySpecies using parameters
    // of the quartile data and the species name data to process how the boxplot should be visualized. It does 
    // this through calculating where on the x-axis the unique species data should go and the width of the boxplot
    // for that species. Because we also iterated through the quartile data, we can then use this to plot out the median
    // lines, whiskers, and box for this visualization having calculated their position on the x-axis 

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.min))
            .attr("y2", yScale(quartiles.q1))
            .attr("stroke", "black");

        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.q3))
            .attr("y2", yScale(quartiles.max))
            .attr("stroke", "black");

        // Draw box
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("fill", colorScale(Species))
            .attr("stroke", "black");

        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.median))
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "black")

        
    });
});