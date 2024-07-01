

import cities from 'all-the-cities';
import sphereKnn from 'sphere-knn';

console.log('=== sphere-knn benchmark ===');

const n = cities.length;
const k = 1000;

const randomPoints = [];
for (let i = 0; i < k; i++) randomPoints.push({
    lon: -180 + 360 * Math.random(),
    lat: -60 + 140 * Math.random()
});

const locations = cities.map(c => c.loc.coordinates);

console.time(`index ${cities.length} points`);
const sphereKnnLookup = sphereKnn(locations);
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
for (let i = 0; i < k; i++) sphereKnnLookup(randomPoints[i].lat, randomPoints[i].lon, 1);
console.timeEnd(`${k} random queries of 1 closest`);
