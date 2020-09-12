

import { v4 as uuidv4 } from 'uuid'
import { type } from 'os'
const D3Node = require('d3-node')
const d3 = require('d3')
const fs = require('fs')
const sharp = require('sharp')

// const bedfordHash: { [key:string]:number } = {}
const bendfordHash = new Map<string, number>()

type TData = { 
    char: string,
    value: number
}

const tempData: TData[] = []

let totalRecords = 1000000
// let totalRecords = 1000
// let totalRecords = 100

for (var i = 0; i < totalRecords; i++) {
    const uuid = uuidv4()
    const char = uuid.charAt(0)
    // const currentValue = bedfordHash[char] + 1 || 1
    const currentValue = bendfordHash.get(char) + 1 || 1
    // console.log(`[${i}: ${char} - ${uuid}] = ${currentValue}`)
    // bedfordHash[char] = currentValue
    bendfordHash.set(char, currentValue)
}

// const bedfordResults = JSON.stringify(bedfordHash, null, 2)
// console.log(`bedfordResults = ${bedfordResults}`)
bendfordHash.forEach( (value, key) => {
    // console.log(`${key}: ${value}`)
    tempData.push( { 'char': key, 'value': value / totalRecords} )
    // tempData.push( { 'char': key, 'value': value } )
})

console.log(`Total generated UUIDs ${totalRecords} produced ${tempData.length} unique hex-based character`)

// const displayData: TData[] = tempData.sort( (a, b) => a.value - b.value)
const displayData: TData[] = tempData.sort( (a, b) => b.value - a.value)

// console.log(`${JSON.stringify(tempData)}`)

const options = {
    d3Module: d3,
    selector: '#chart',
    container: '<div id="container"><div id="chart"></div></div>'
  }
  
// Create a d3-node object with the selector and the required d3 module. 
const d3n = new D3Node(options)

const margin = {
    top: 10, right: 5, bottom: 30, left: 5 
};
const width = 2000 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;
const svgWidth = width + margin.left + margin.right;
const svgHeight = height + margin.top + margin.bottom;

// Create an svg element with the width and height defined.
const svg = d3n.createSVG(svgWidth, svgHeight);

// const tempData = [{ year: 1111, value: 100 }, { year: 2019, value: 200 }, { year: 2018, value: 30 }, { year: 2017, value: 50 }, { year: 2016, value: 80 }]

// Create the scales for x-axis and y-axis. 
const xScale = d3.scaleBand().range([0, width]).padding(0.4)
const yScale = d3.scaleLinear().range([height, 0])

let yMax = d3.max(displayData, (d:TData) => { return d.value; })
yMax += yMax * 0.3
xScale.domain(displayData.map((d:TData) => { return d.char; }))
yScale.domain([0, yMax])

// Set the background of the entire svg to a desired color. This will make the background look uniform on everyone's computer.
svg.append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('fill', 'white')

// Add a title text to your bar chart. 
svg.append('text')
  .attr('transform', 'translate(150,0)')
  .attr('x', 50)
  .attr('y', 50)
  .attr('font-size', '24px')
  .text('Observed First Characters from UUIDv4')

// Append a group element to which the bars and axes will be added to.
svg.append('g').attr('transform', `translate(${ 100 },${ 100 })`)

// Appending x-axis
svg.append('g')
    .attr('transform', `translate(50,${ height })`)
    .call(d3.axisBottom(xScale))
    .append('text')
    .attr('y', height - 380)
    .attr('x', width - 500)
    .attr('text-anchor', 'end')
    .attr('stroke', 'black')
    .attr('font-size', '20px')
    .text('First Hex Character')


// Appending y-aixs
svg.append('g')
    .attr('transform', 'translate(50,0)')
    .call(d3.axisLeft(yScale).tickFormat((d:number) => {
    return `%${ d * 100 }`;
    })
    .ticks(5))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 150)
    .attr('x', -150)
    .attr('dy', '-9.1em')
    .attr('text-anchor', 'end')
    .attr('stroke', 'black')
    .attr('font-size', '20px')
    .text('Frequency')

// Appending the bars
svg.selectAll('.bar')
    .data(displayData)
    .enter().append('rect')
    .attr('transform', 'translate(50,0)')
    .attr('class', 'bar')
    .attr('x', (d:TData) => { return xScale(d.char); })
    .attr('y', (d:TData) => { return yScale(d.value); })
    .attr('width', xScale.bandwidth())
    .attr('height', (d:any) => { return height - yScale(d.value); })
    .style('fill', 'lightblue');


fs.writeFileSync('out.svg', d3n.svgString())

// Convert the SVG into a PNG. 
sharp('out.svg')
    .png()
    .toFile('sharp.png')
    .then((info: any ) => {
        console.log('Svg to Png conversion completed', info);
    })
    .catch((err: Error) => {
        console.log(err);
    });
