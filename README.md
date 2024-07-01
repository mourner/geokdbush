## geokdbush [![Node](https://github.com/mourner/geokdbush/actions/workflows/node.yml/badge.svg)](https://github.com/mourner/geokdbush/actions/workflows/node.yml) [![Simply Awesome](https://img.shields.io/badge/simply-awesome-brightgreen.svg)](https://github.com/mourner/projects)

A geographic extension for [KDBush](https://github.com/mourner/kdbush),
the fastest static spatial index for points in JavaScript.

It implements fast [nearest neighbors](https://en.wikipedia.org/wiki/Nearest_neighbor_search) queries
for locations on Earth, taking Earth curvature and date line wrapping into account.
Inspired by [sphere-knn](https://github.com/darkskyapp/sphere-knn), but uses a different algorithm.

### Example

```js
import KDBush from 'kdbush';
import * as geokdbush from 'geokdbush';

const index = new KDBush(points.length);
for (conts {lon, lat} of points) index.add(lon, lat);
index.finish();

const nearestIds = geokdbush.around(index, -119.7051, 34.4363, 1000);

const nearest = nearestIds.map(id => points[id]);
```

### API

#### geokdbush.around(index, longitude, latitude[, maxResults, maxDistance, filterFn])

Returns an array of the closest points from a given location in order of increasing distance.

- `index`: [kdbush](https://github.com/mourner/kdbush) index.
- `longitude`: query point longitude.
- `latitude`: query point latitude.
- `maxResults`: (optional) maximum number of points to return (`Infinity` by default).
- `maxDistance`: (optional) maximum distance in kilometers to search within (`Infinity` by default).
- `filterFn`: (optional) a function to filter the results with.

#### geokdbush.distance(longitude1, latitude1, longitude2, latitude2)

Returns great circle distance between two locations in kilometers.

### Performance

This library is incredibly fast.
The results below were obtained with `npm run bench`
(Node v20, Macbook Pro 2020 M1 Pro).

benchmark | geokdbush | sphere-knn | naive
--- | ---: | ---: | ---:
index 138398 points | 57.6ms | 408ms | n/a
query 1000 closest | 1.6ms | 1.8ms | 72ms
query 50000 closest | 14.7ms | 91.5ms | 72ms
query all 138398 | 33.7ms | 500ms | 72ms
1000 queries of 1 | 24.7ms | 27.5ms | 11.1s
