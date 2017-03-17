'use strict';

var cities = require('all-the-cities');
var kdbush = require('kdbush');
var geokdbush = require('./');

console.log(cities.length + ' points');

console.time('index');
var index = kdbush(cities, (p) => p.lon, (p) => p.lat);
console.timeEnd('index');

console.time('query');
var points = geokdbush.around(index, -119.7051, 34.4363, 1000);
console.timeEnd('query');

console.log('found ' + points.length + ' points');

console.log('first 5: ' + points.slice(0, 5).map(p => p.name).join(', '));
