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
    var points = geokdbush.around(index, 30.5, 50.5, Infinity, 50);

    t.same(points.map(p => p.name).join(', '),
        'Kiev, Vyshhorod, Kotsyubyns’ke, Sofiyivska Borschagivka, Vyshneve, Hostomel’, ' +
        'Knyazhichi, Brovary, Trebukhiv, Dymer, Semypolky');

    t.end();
});

test('performs search using filter function', function (t) {
    var points = geokdbush.around(index, 30.5, 50.5, 10, Infinity, p => p.population > 1000000);

    t.same(points.map(p => p.name).join(', '),
        'Kiev, Dnipropetrovsk, Minsk, Kharkiv, Odessa, Donets’k, Moscow, Rostov-na-Donu, Bucharest, Warsaw');

    t.end();
});
