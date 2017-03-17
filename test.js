'use strict';

var test = require('tape').test;
var kdbush = require('kdbush');
var cities = require('all-the-cities');
var geokdbush = require('./');

var index = kdbush(cities, (p) => p.lon, (p) => p.lat);

test('performs search according to maxResults', function (t) {
    var points = geokdbush.around(index, -119.7051, 34.4363, 5);

    t.same(points.map(p => p.name).join(', '), 'Mission Canyon, Santa Barbara, Montecito, Summerland, Goleta');

    t.end();
});

test('performs search within maxDistance', function (t) {
    var points = geokdbush.around(index, 30.5, 50.5, Infinity, 20);

    t.same(points.map(p => p.name).join(', '),
        'Kiev, Vyshhorod, Kotsyubyns’ke, Sofiyivska Borschagivka, Vyshneve, Kriukivschina, Irpin’, Hostomel’, Khotiv');

    t.end();
});

test('performs search using filter function', function (t) {
    var points = geokdbush.around(index, 30.5, 50.5, 10, Infinity, p => p.population > 1000000);

    t.same(points.map(p => p.name).join(', '),
        'Kiev, Dnipropetrovsk, Kharkiv, Minsk, Odessa, Donets’k, Warsaw, Bucharest, Moscow, Rostov-na-Donu');

    t.end();
});

test('performs exhaustive search in correct order', function (t) {
    var points = geokdbush.around(index, 30.5, 50.5, Infinity, Infinity, p => p.population > 100000);

    var c = {lon: 30.5, lat: 50.5};
    var sorted = cities
        .filter((p) => p.population > 100000)
        .map((item) => ({item: item, dist: greatCircleDist(c, item)}))
        .sort((a, b) => a.dist - b.dist);

    for (var i = 0; i < sorted.length; i++) {
        t.equal(
            sorted[i].item.name + ' ' + sorted[i].dist,
            points[i].name + ' ' + greatCircleDist(points[i], c));
    }

    t.end();
});

var rad = Math.PI / 180;

function greatCircleDist(a, b) {
    var d = Math.sin(a.lat * rad) * Math.sin(b.lat * rad) +
            Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.cos((a.lon - b.lon) * rad);
    return 6371 * Math.acos(Math.min(d, 1));
}
