

import cities from 'all-the-cities';
import VPTreeFactory from 'vptree';

console.log('=== vptree.js benchmark ===');

const rad = Math.PI / 180;

const n = cities.length;
const k = 1000;

const randomPoints = [];
for (let i = 0; i < k; i++) randomPoints.push({
    loc: {
        coordinates: [
            -180 + 360 * Math.random(),
            -60 + 140 * Math.random()
        ]
    }
});

console.time(`index ${n} points`);
const index = VPTreeFactory.build(cities, distance);
console.timeEnd(`index ${n} points`);

console.time('query 1000 closest');
index.search({loc: {coordinates: [-119.7051, 34.4363]}}, 1000);
console.timeEnd('query 1000 closest');

console.time('query 50000 closest');
index.search({loc: {coordinates: [-119.7051, 34.4363]}}, 50000);
console.timeEnd('query 50000 closest');

console.time(`query all ${n}`);
index.search({loc: {coordinates: [-119.7051, 34.4363]}}, Infinity);
console.timeEnd(`query all ${n}`);

console.time(`${k} random queries of 1 closest`);
for (let i = 0; i < k; i++) index.search(randomPoints[i], 1);
console.timeEnd(`${k} random queries of 1 closest`);

function distance(a, b) {
    const [lon1, lat1] = a.loc.coordinates;
    const [lon2, lat2] = b.loc.coordinates;
    const d = Math.sin(lat1 * rad) * Math.sin(lat2 * rad) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos((lon1 - lon2) * rad);
    return 6371 * Math.acos(Math.min(d, 1));
}
