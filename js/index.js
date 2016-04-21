import d3 from "d3";

// the data has IDs for d3 object constancy
let data = [
  {id: 0, value: 10},
  {id: 1, value: 6},
  {id: 2, value: 1},
  {id: 3, value: 7},
  {id: 4, value: 11},
  {id: 5, value: 5},
];

// d3 doesn't really play well w/ sparse arrays
// so we'll use placeholder to temporary remove itmes from data array
let placeholder = {
  id: 'placeholder',
  value: 0
}

// Load data visualization
const svg = d3.select('#insertion-sort-visualization');

const height = 500;
const width = 600;

svg.attr({
  height: height,
  width: width
});

const margin = {top: 100, right: 200, bottom: 50, left: 70};
const innerHeight = height - margin.top - margin.bottom;
const innerWidth = width - margin.left - margin.right;

const defaultBarColor = '#666';
const highlightedBarColor = '#f00';

const barPadding = 20;

let barWidth;
let y = d3.scale.linear();

// visualization state
let currentlySorting;
let indexI;
let indexJ;
let currentStep;

function loadDataVisualization(){
  // initialize visualization state
  currentlySorting = placeholder;
  indexI = 1;
  indexJ = 1;
  currentStep = 'setToSort';

  svg.html('');

  barWidth = (innerWidth - (data.length - 1) * barPadding) / data.length;

  y = d3.scale.linear();
  y.domain([0, d3.max(data.map(d => d.value))]);
  y.range([innerHeight, 0]);

  svg.selectAll('rect')
    .data(data, (d, i) => d.id)
    .enter()
    .append('rect')
    .attr('x', (d, i) => margin.left + (i * barWidth) + (i * barPadding))
    .attr('y', d => height - margin.bottom - (innerHeight - y(d.value)))
    .attr('height', d => innerHeight - y(d.value))
    .attr('width', barWidth)
    .attr('fill', d => {
      if (d.id === 'placeholder') return 'transparent';
      else return defaultBarColor;
    });

  const yAxis = d3.svg.axis();
  yAxis.scale(y);
  yAxis.orient('left');

  svg.append('g')
    .classed('axis axis-y', true)
    .attr('transform', `translate(${margin.left - 20},${margin.top})`)
    .call(yAxis);

  svg.selectAll('text.indices')
    .data(data)
    .enter()
    .append('text')
    .classed('indices', true)
    .attr('x', (d, i) => margin.left + (i * barWidth) + (i * barPadding) + (barWidth / 2))
    .attr('y', height - margin.bottom + 20)
    .attr('text-anchor', 'middle')
    .style('fill', '#999')
    .text((d, i) => i);

  svg.append('text')
    .classed('value-to-sort', true)
    .attr('x', width - 100)
    .attr('y', height - margin.bottom + 20)
    .style('fill', '#999')
    .text('value to sort');

  svg.append('text')
    .attr('id', 'sorting-status')
    .attr('x', 50)
    .attr('y', 50)
    .style('fill', '#333')
    .style('font-size', '20px')
    .text('press the → key to start');
}

loadDataVisualization()

// how long should each insertion sort stage transition take
const transitionDuration = 1000;

// move through insertion sort by pressing right arrow
document.body.addEventListener('keydown', e => {
  if (e.which === 39) nextStep();
});

d3.select('#js-custom-data-btn')
  .on('click', _ => {
    const rawInput = d3.select('#js-custom-data-input').property('value');
    if (rawInput === '') return;
    const arrayOfStringInputs = rawInput.split(',');
    const arrayOfNumbers = arrayOfStringInputs.map(Number);
    data = arrayOfNumbers.map((n, i) => ({id: i, value: n}));
    loadDataVisualization();
  });

// possible steps
//  setToSort
//  compare
//  shift
//  insert
//  done

function nextStep(){
  if (currentStep === 'setToSort') {
    d3.select('#sorting-status').text('selecting item to sort');
    unhighlight();
    currentlySorting = data[indexI];
    data[indexI] = placeholder;
    currentStep = 'compare';
    render();
    return;
  }

  if (currentStep === 'compare') {
    d3.select('#sorting-status').text('comparing');
    highlightCompared();
    if (currentlySorting.value < data[indexJ - 1].value){
      currentStep = 'shift';
    }
    if (currentlySorting.value >= data[indexJ - 1].value){
      currentStep = 'insert';
    }
    return;
  }

  if (currentStep === 'shift') {
    d3.select('#sorting-status').text('shifting over');
    data[indexJ] = data[indexJ - 1];
    data[indexJ - 1] = placeholder;
    render();
    if (indexJ - 1 === 0) {
      indexJ--;
      currentStep = 'insert';
    }
    else {
      indexJ--;
      currentStep = 'compare';
    }
    return;
  }

  if (currentStep === 'insert') {
    d3.select('#sorting-status').text('inserting item in proper place');
    data[indexJ] = currentlySorting;
    currentlySorting = placeholder;
    render();

    // did we insert last one?
    if (indexI === data.length - 1) {
      currentStep = 'done';
      unhighlight();
      currentStep = 'done';
    }

    // if not keep going
    else {
      indexI++;
      indexJ = indexI;
      currentStep = 'setToSort';
    }

    return;
  }

  if (currentStep === 'done') {
    d3.select('#sorting-status').text('all done!');
  }
}

function render(){
  svg.selectAll('rect')
    .data(data.concat(currentlySorting), (d, i) => d.id)
    .transition()
    .transition(transitionDuration)
    .attr('x', (d, i) => {
      if (d === currentlySorting) return width - (barWidth / 2) - 60;
      return margin.left + (i * barWidth) + (i * barPadding)
    });
}

function highlightCompared(){
  svg.selectAll('rect')
    .attr('fill', d => {
      if (d === currentlySorting) return highlightedBarColor;
      if (d === data[indexJ - 1]) return highlightedBarColor;
      return defaultBarColor;
    });
}

function unhighlight(){
  svg.selectAll('rect')
    .attr('fill', defaultBarColor);
}
