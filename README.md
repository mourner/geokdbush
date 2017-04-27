## geokdbush [![Build Status](https://travis-ci.org/mourner/geokdbush.svg?branch=master)](https://travis-ci.org/mourner/geokdbush)

A geographic extension for [kdbush](https://github.com/mourner/kdbush),
the fastest static spatial index for points in JavaScript.

It implements fast [nearest neighbors](https://en.wikipedia.org/wiki/Nearest_neighbor_search) queries
for locations on Earth, taking Earth curvature and date line wrapping into account.
Inspired by [sphere-knn](https://github.com/darkskyapp/sphere-knn), but uses a different algorithm.

### Example

```js
var kdbush = require('kdbush');
var geokdbush = require('geokdbush');

var index = kdbush(points, (p) => p.lon, (p) => p.lat);

var nearest = geokdbush.around(index, -119.7051, 34.4363, 1000);
```

### API

#### geokdbush.around(index, longitude, latitude[, maxResults, maxDistance, filterFn])

Returns an array of the closest points from a given location in order of increasing distance.

- `index`: [kdbush](https://github.com/mourner/kdbush) index.
- `longitude`: query point longitude.
- `latitude`: query point latitude.
- `maxResults`: (optional) maximum number of points to return (`Infinity` by default).
- `maxDistance`: (optional) maximum distance to search within (`Infinity` by default).
- `filterFn`: (optional) a function to filter the results with.

#### geokdbush.distance(longitude1, latitude1, longitude2, latitude2)

Returns great circle distance between two locations in kilometers.

### Performance

This library is incredibly fast.
The results below were obtained with `npm run bench`
(Node v7.7.2, Macbook Pro 15 mid-2012).

benchmark | geokdbush | sphere-knn | naive
--- | ---: | ---: | ---:
index 138398 points | 69ms | 967ms | n/a
query 1000 closest | 4ms | 4ms | 155ms
query 50000 closest | 31ms | 368ms | 155ms
query all 138398 | 80ms | 29.7s | 155ms
1000 queries of 1 | 55ms | 165ms | 18.4s
