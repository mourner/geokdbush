import cities from 'all-the-cities';

console.log('=== naive benchmark ===');

const rad = Math.PI / 180;

const n = cities.length;
const k = 1000;
const p = {loc: {coordinates: [-119.7051, 34.4363]}};

const randomPoints = [];
for (let i = 0; i < k; i++) randomPoints.push({
    loc: {
        coordinates: [
            -180 + 360 * Math.random(),
            -60 + 140 * Math.random()
        ]
    }
});

console.time(`query (sort) all ${n}`);
const items = cities.map(city => ({p: city, dist: dist(city, p)}));
items.sort((a, b) => a.dist - b.dist);
console.timeEnd(`query (sort) all ${n}`);

console.time(`${k} random queries of 1 closest`);
for (let i = 0; i < k; i++) findClosest(randomPoints[i]);
console.timeEnd(`${k} random queries of 1 closest`);

function findClosest(p) {
    let minDist = Infinity;
    let closest = null;
    for (let i = 0; i < cities.length; i++) {
        const d = dist(p, cities[i]);
        if (d < minDist) {
            minDist = d;
            closest = cities[i];
        }
    }
    return closest;
}

function dist(a, b) {
    const [lon1, lat1] = a.loc.coordinates;
    const [lon2, lat2] = b.loc.coordinates;
    const d = Math.sin(lat1 * rad) * Math.sin(lat2 * rad) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos((lon1 - lon2) * rad);
    return 6371 * Math.acos(Math.min(d, 1));
}
