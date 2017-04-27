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
    var points = geokdbush.around(index, 30.5, 50.5);

    var c = {lon: 30.5, lat: 50.5};
    var sorted = cities
        .map((item) => ({item: item, dist: geokdbush.distance(c.lon, c.lat, item.lon, item.lat)}))
        .sort((a, b) => a.dist - b.dist);

    for (var i = 0; i < sorted.length; i++) {
        var dist = geokdbush.distance(points[i].lon, points[i].lat, c.lon, c.lat);
        if (dist !== sorted[i].dist) {
            t.fail(points[i].name + ' vs ' + sorted[i].item.name);
            break;
        }
    }
    t.pass('all points in correct order');

    t.end();
});

test('calculates great circle distance', function (t) {
    t.equal(10131.7396, Math.round(1e4 * geokdbush.distance(30.5, 50.5, -119.7, 34.4)) / 1e4);
    t.end();
});
