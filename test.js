import test from 'node:test';
import assert from 'node:assert/strict';
import KDBush from 'kdbush';
import cities from 'all-the-cities';
import * as geokdbush from './index.js';

const index = new KDBush(cities.length);
for (const {loc: {coordinates: [lon, lat]}} of cities) index.add(lon, lat);
index.finish();

test('performs search according to maxResults', () => {
    const points = geokdbush.around(index, -119.7051, 34.4363, 5);

    assert.equal(points.map(id => cities[id].name).join(', '), 'Mission Canyon, Santa Barbara, Montecito, Summerland, Goleta');
});

test('performs search within maxDistance', () => {
    const points = geokdbush.around(index, 30.5, 50.5, Infinity, 20);

    assert.equal(points.map(id => cities[id].name).join(', '),
        'Kyiv, Vyshhorod, Pohreby, Kotsyubyns’ke, Horenka, Sofiyivska Borschagivka, Novi Petrivtsi, Vyshneve, Kriukivschina, Irpin, Hostomel, Chabany, Khotiv, Pukhivka');
});

test('performs search using filter function', () => {
    const points = geokdbush.around(index, 30.5, 50.5, 10, Infinity, id => cities[id].population > 200000 && cities[id].country === 'UA');

    assert.equal(points.map(id => cities[id].name).join(', '),
        'Kyiv, Chernihiv, Zhytomyr, Cherkasy, Vinnytsia, Kropyvnytskyi, Kremenchuk, Khmelnytskyi, Rivne, Poltava');
});

test('performs exhaustive search in correct order', () => {
    const points = geokdbush.around(index, 30.5, 50.5);

    const lon = 30.5;
    const lat = 50.5;
    const sorted = cities
        .map(({loc: {coordinates: [plon, plat]}}, id) => ({id, dist: geokdbush.distance(lon, lat, plon, plat)}))
        .sort((a, b) => a.dist - b.dist);

    for (let i = 0; i < sorted.length; i++) {
        const [plon, plat] = cities[points[i]].loc.coordinates;
        const dist = geokdbush.distance(plon, plat, lon, lat);
        if (dist !== sorted[i].dist) {
            assert.fail(`${cities[points[i]].name  } vs ${  cities[sorted[i].id].name}`);
            break;
        }
    }
    // all points in correct order
});

test('calculates great circle distance', () => {
    assert.equal(10131.7396, Math.round(1e4 * geokdbush.distance(30.5, 50.5, -119.7, 34.4)) / 1e4);
});
