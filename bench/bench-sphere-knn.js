'use strict';

var cities = require('all-the-cities');
var sphereKnn = require('sphere-knn');

console.log('=== sphere-knn benchmark ===');

var n = cities.length;
var k = 1000;

var randomPoints = [];
for (var i = 0; i < k; i++) randomPoints.push({
    lon: -180 + 360 * Math.random(),
    lat: -60 + 140 * Math.random()
});

console.time(`index ${cities.length} points`);
var sphereKnnLookup = sphereKnn(cities);
console.timeEnd(`index ${cities.length} points`);

console.time('query 1000 closest');
sphereKnnLookup(34.4363, -119.7051, 1000);
console.timeEnd('query 1000 closest');

console.time('query 50000 closest');
sphereKnnLookup(34.4363, -119.7051, 50000);
console.timeEnd('query 50000 closest');

console.time(`query all ${n}`);
sphereKnnLookup(34.4363, -119.7051, Infinity);
console.timeEnd(`query all ${n}`);

console.time(`${k} random queries of 1 closest`);
for (i = 0; i < k; i++) sphereKnnLookup(randomPoints[i].lat, randomPoints[i].lon, 1);
console.timeEnd(`${k} random queries of 1 closest`);
