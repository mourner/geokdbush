'use strict';

var cities = require('all-the-cities');
var VPTreeFactory = require('vptree');

console.log('=== vptree.js benchmark ===');

var rad = Math.PI / 180;

var n = cities.length;
var k = 1000;

var randomPoints = [];
for (var i = 0; i < k; i++) randomPoints.push({
    lon: -180 + 360 * Math.random(),
    lat: -60 + 140 * Math.random()
});

console.time(`index ${n} points`);
var index = VPTreeFactory.build(cities, distance);
console.timeEnd(`index ${n} points`);

console.time('query 1000 closest');
index.search({lon: -119.7051, lat: 34.4363}, 1000);
console.timeEnd('query 1000 closest');

console.time('query 50000 closest');
index.search({lon: -119.7051, lat: 34.4363}, 50000);
console.timeEnd('query 50000 closest');

console.time(`query all ${n}`);
index.search({lon: -119.7051, lat: 34.4363}, Infinity);
console.timeEnd(`query all ${n}`);

console.time(`${k} random queries of 1 closest`);
for (i = 0; i < k; i++) index.search({lon: randomPoints[i].lon, lat: randomPoints[i].lat}, 1);
console.timeEnd(`${k} random queries of 1 closest`);

function distance(a, b) {
    var d = Math.sin(a.lat * rad) * Math.sin(b.lat * rad) +
            Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.cos((a.lon - b.lon) * rad);
    return 6371 * Math.acos(Math.min(d, 1));
}
