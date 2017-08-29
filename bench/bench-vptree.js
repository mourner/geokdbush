'use strict';

var cities = require('all-the-cities');
var VPTreeFactory = require('vptree');


var earthRadius = 6371;
var rad = Math.PI / 180;
function greatCircleDist(lng, lat, lng2, lat2, cosLat, sinLat) {
    var cosLngDelta = Math.cos((lng2 - lng) * rad);
    return earthRadius * Math.acos(greatCircleDistPart(lat2, cosLat, sinLat, cosLngDelta));
}
function greatCircleDistPart(lat, cosLat, sinLat, cosLngDelta) {
    var d = sinLat * Math.sin(lat * rad) +
            cosLat * Math.cos(lat * rad) * cosLngDelta;
    return Math.min(d, 1);
}
function distance(p1, p2) {
    var lng = p1.lon, lat = p1.lat, lng2 = p2.lon, lat2 = p2.lat;
    return greatCircleDist(lng, lat, lng2, lat2, Math.cos(lat * rad), Math.sin(lat * rad));
}

console.log('=== vptree.js benchmark ===');

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
