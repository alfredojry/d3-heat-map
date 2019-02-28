document.addEventListener('DOMContentLoaded', function () {
  req = new XMLHttpRequest();
  req.open('GET', 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json', true);
  req.send();
  req.onload = function () {
    let json = JSON.parse(req.responseText);
    let dataset = [...json.monthlyVariance];
    
    // #Set SVG dimentions
    const padding = 70;
    const hAreaLegend = 80;
    const cellWidth = 8;
    const cellHeight = 30;
    const minYear = d3.min(dataset, d => d.year);
    const maxYear = d3.max(dataset, d => d.year);
    const w = (maxYear - minYear + 1) * cellWidth + 2 * padding;
    const h = 12 * cellHeight + 2 * padding + hAreaLegend;
    
    // #Define SVG
    const svg = d3.select('#svg-container')
                  .append('svg')
                  .attr('width', w)
                  .attr('height', h);
    
    // #Define the div to the tooltip
    const tooltip = d3.select('body')
                      .append('div')
                      .attr('class', 'div-tooltip')
                      .style('opacity', 0);
    
    // #Define the scale
    // ##X - Axis: Years
    const xScale = d3.scaleBand()
                     .domain(dataset.map(d => d.year))
                     .range([padding, w - padding]);
    const xAxis = d3.axisBottom(xScale)
                    .tickValues(xScale.domain().filter(item => item % 10 === 0));
    
    // #Y - Axis: Months
    const monthToStr = num => {
      switch(num) {
        case 1:
          return 'January';
        case 2:
          return 'February';
        case 3:
          return 'March';
        case 4:
          return 'April';
        case 5:
          return 'May';
        case 6:
          return 'June';
        case 7:
          return 'July';
        case 8:
          return 'August';
        case 9:
          return 'September'
        case 10:
          return 'October'
        case 11:
          return 'November';
        case 12:
          return 'December';
      }
    };
    dataset.forEach(d => {
      d.monthToStr = monthToStr(d.month);
    });
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const yScale = d3.scaleBand()
                     .domain(months)
                     .range([padding, h - padding - hAreaLegend]);
    const yAxis = d3.axisLeft(yScale);
    
    // #Colors scale: Temperature
    // Follow example of "D3 Sun Heatmap example": ** https://bl.ocks.org/mourner/4946049
    const {baseTemperature} = json;
    dataset.forEach(d => {
      d.temperature = parseFloat((baseTemperature + d.variance).toPrecision(4));
    });
    const minTemperature = d3.min(dataset, d => d.temperature);
    const maxTemperature = d3.max(dataset, d => d.temperature);
    const r = (maxTemperature - minTemperature) / 4;
    const arithProgression = [minTemperature, minTemperature + r, minTemperature + 2 * r, minTemperature + 3 * r, maxTemperature];
    const arrColors = ['#0239ff', '#77bcf4', '#f9ff96', '#ff9d00', '#ff0000'];
    const colorScale = d3.scaleLinear()
                         .domain(arithProgression)
                         .range(arrColors);
    
    // #Add axis to visualization 
    svg.append('g')
       .attr('id', 'x-axis')
       .attr('transform', 'translate(0,' + (h - padding - hAreaLegend) + ')')
       .call(xAxis);
    svg.append('g')
       .attr('id', 'y-axis')
       .attr('transform', 'translate(' + padding + ',0)')
       .call(yAxis);
    
    // #Append the rectangles to SVG
   svg.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => d.temperature)
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(d.monthToStr))
      .attr('fill', d => colorScale(d.temperature))
      .on('mouseover', d => {
     tooltip.attr('id', 'tooltip')
            .attr('data-year', d.year)
            .transition()
            .duration(200)
            .style('opacity', 0.9);
     tooltip.html(d.year + ' - ' + d.monthToStr + '<br>' + d.temperature.toPrecision(2) + ' ºC<br>' + (d.variance <= 0 ? d.variance.toPrecision(2) : '+' + d.variance.toPrecision(2)) + ' ºC')
            .style('left', d3.event.pageX + 5 + 'px')
            .style('top', d3.event.pageY + 5 + 'px');
   })
      .on('mouseout', d => {
     tooltip.transition()
            .duration(200)
            .style('opacity', 0)
   });
    
    // #Draw the legend
    const legendWidth = 200;
    const legendHeight = 40;
    
    const xScaleLegend = d3.scaleLinear()
                           .domain([minTemperature, maxTemperature])
                           .range([0, legendWidth]);
    
    const xAxisLegend = d3.axisBottom(xScaleLegend)
                          .tickValues(arithProgression)
                          .tickFormat(d3.format('.1f'));
    
    const legend = svg.append('g')
                      .attr('id', 'legend')
                      .attr('transform', 'translate(' + padding + ',' + (h - hAreaLegend) + ')');
    
    legend.append('g')
          .selectAll('rect')
          .data(arithProgression)
          .enter()
          .append('rect')
          .attr('x', d => xScaleLegend(d))
          .attr('y', 0)
          .attr('width', legendWidth / (arithProgression.length - 1))
          .attr('height', legendHeight)
          .attr('fill', d => colorScale(d))
          .attr('stroke', '#000000')
          .attr('stroke-width', 1);
    
    legend.append('g')
          .attr('transform', 'translate(' + (legendWidth / (arithProgression.length - 1)) + ',' + legendHeight + ')')
          .call(xAxisLegend);
  }
});