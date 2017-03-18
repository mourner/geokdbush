'use strict';

var cities = require('all-the-cities');

console.log('=== naive benchmark ===');

var rad = Math.PI / 180;

var n = cities.length;
var k = 1000;
var p = {lon: -119.7051, lat: 34.4363};

var randomPoints = [];
for (var i = 0; i < k; i++) randomPoints.push({
    lon: -180 + 360 * Math.random(),
    lat: -60 + 140 * Math.random()
});

var compareDist = (a, b) => a.dist - b.dist;

console.time(`query (sort) all ${n}`);
var items = cities.map((city) => ({p: city, dist: dist(city, p)}));
items.sort(compareDist);
console.timeEnd(`query (sort) all ${n}`);

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
