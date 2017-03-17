'use strict';

var cities = require('all-the-cities');
var kdbush = require('kdbush');
var geokdbush = require('./');
var sphereKnn = require('sphere-knn');

console.log(cities.length + ' points');

console.time('geokdbush index');
var index = kdbush(cities, (p) => p.lon, (p) => p.lat);
console.timeEnd('geokdbush index');

console.time('geokdbush query');
var points = geokdbush.around(index, -119.7051, 34.4363, 1000);
console.timeEnd('geokdbush query');

console.log('found ' + points.length + ' points');

console.log('first 5: ' + points.slice(0, 5).map(p => p.name).join(', '));

console.time('geokdbush query for each point');
for (var i = 0; i < cities.length; i++) {
    geokdbush.around(index, cities[i].lon, cities[i].lat, 5);
}
console.timeEnd('geokdbush query for each point');

console.time('sphere-knn index');
var sphereKnnLookup = sphereKnn(cities);
console.timeEnd('sphere-knn index');

console.time('sphere-knn query');
sphereKnnLookup(34.4363, -119.7051, 1000);
console.timeEnd('sphere-knn query');

console.time('sphere-knn query');
sphereKnnLookup(34.4363, -119.7051, 1000);
console.timeEnd('sphere-knn query');

console.time('sphere-knn query for each point');
for (i = 0; i < cities.length; i++) {
    sphereKnnLookup(cities[i].lat, cities[i].lon, 5);
}
console.timeEnd('sphere-knn query for each point');
