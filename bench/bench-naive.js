'use strict';

var cities = require('all-the-cities');
var select = require('quickselect');

console.log('=== naive benchmark ===');

var rad = Math.PI / 180;

var n = cities.length;
var k = 1000;
var p = {lon: -119.7051, lat: 34.4363};

var randomPoints = [];
for (var i = 0; i < k; i++) randomPoints.push({
    lon: -180 + 360 * Math.random(),
    lat: -90 + 180 * Math.random()
});

var compare = (a, b) => dist(p, a) - dist(p, b);

console.time('query 1000 closest');
select(cities.slice(), 1000, 0, n - 1, compare);
console.timeEnd('query 1000 closest');

console.time('query 50000 closest');
select(cities.slice(), 50000, 0, n - 1, compare);
console.timeEnd('query 50000 closest');

console.time(`query all ${n}`);
cities.slice().sort(compare);
console.timeEnd(`query all ${n}`);

console.time(`${k} random queries of 1 closest`);
for (i = 0; i < k; i++) findClosest(randomPoints[i]);
console.timeEnd(`${k} random queries of 1 closest`);

function findClosest(p) {
    var minDist = Infinity;
    var closest = null;
    for (var i = 0; i < cities.length; i++) {
        var d = dist(p, cities[i]);
        if (d < minDist) {
            minDist = d;
            closest = cities[i];
        }
    }
    return closest;
}

function dist(a, b) {
    var d = Math.sin(a.lat * rad) * Math.sin(b.lat * rad) +
            Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.cos((a.lon - b.lon) * rad);
    return 6371 * Math.acos(Math.min(d, 1));
}
