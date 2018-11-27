const margin = {top: 100, right: 50, bottom: 150, left: 100};

const width = 960;
const height = 600;

const educationData = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const countyData = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

const path = d3.geoPath();

const svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

// append tooltip to web page
const tooltip = d3.select('body').append('div')
.attr('class', 'tooltip')
.attr('id', 'tooltip')
.style('opacity', 0);

d3.json(educationData).then((education)=>{

  d3.json(countyData).then((topology)=>{    
    
const geojson = topojson.feature(topology, topology.objects.counties);    
//loop over geojson and education data and append education data to id's that match the education FIPS id.
geojson.features.forEach(geo => {
    education.forEach(data => {
      if (data.fips === geo.id) {
        geo.education = data.bachelorsOrHigher;
      } 
    });
  });  
      
   const minEd = d3.min(education, (d,i)=>education[i].bachelorsOrHigher);
   const maxEd = d3.max(education, (d,i)=>education[i].bachelorsOrHigher);    
   const color =  d3.scaleSequential(d3.interpolateYlGn).domain([minEd, maxEd]);
    
   chartGroup.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("class","text")
        .attr("id", "title")
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("text-decoration", "underline")  
        .text("US Rate of Education by County");
    
      chartGroup.append("text")
        .attr("x", (width / 2))             
        .attr("y", 24 - (margin.top / 2))
        .attr("id", "description")
        .attr("class","text")
        .attr("text-anchor", "middle")  
        .style("font-size", "12px") 
        .style("text-decoration", "underline")  
        .text("(Bachelors degree or higher)");  
    
   chartGroup.append('g').selectAll('path')
  .data(geojson.features)
  .enter().append('path')
  .attr('d', path)
  .attr('class', 'county')
  .attr('data-fips', (d,i) => geojson.features[i].id)
  .attr('data-education', (d,i) => geojson.features[i].education)
  .style('fill',(d,i) => color(geojson.features[i].education))
    .on("mouseover", d => {
    tooltip
    .transition()
    .duration(50)
    .style('opacity', 0.9)
    
    tooltip.attr('data-fips', d.id);
    tooltip.attr('data-education', d.education);
    
    tooltip
    .html(`<strong>College Educated:</strong> ${d.education}%<br/>
           <strong>FIPS:</strong> ${d.id}`)
    .style("left", d3.event.pageX - 75 + "px")
    .style("top", d3.event.pageY - 100 + "px");
    
    
  })
  .on("mouseout", () => {
    tooltip
    .transition()
    .duration(50)
    .style("opacity", 0);
  });
    
  const legend = d3.scaleLinear().domain([minEd, maxEd]).range([color(minEd), color(maxEd)]);
  
  svg.append('g').attr('class', 'legend').attr('id','legend').attr('transform', `translate(${margin.left},${height + margin.top + (margin.bottom / 2)})`);
  
  const legendLinear = d3.legendColor().shape("rect")
                         .shapeWidth(30).cells(5).orient('horizontal').scale(legend);
  
  svg.select(".legend").call(legendLinear);
    
  }).catch(e => {
    console.log(e);
});
  
}).catch(e => {
    console.log(e);
});