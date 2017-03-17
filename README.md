## geokdbush

A geographic extension for [kdbush](https://github.com/mourner/kdbush),
the fastest static spatial index for points in JavaScript.

It implements fast [nearest neighbors](https://en.wikipedia.org/wiki/Nearest_neighbor_search) queries
for locations on Earth, taking Earth curvature and date line wrapping into account.

It's similar to [sphere-knn](https://github.com/darkskyapp/sphere-knn), but significantly faster.

### Example

```js
var kdbush = require('kdbush');
var geokdbush = require('geokdbush');

var index = kdbush(points, (p) => p.lon, (p) => p.lat);

var nearest = geokdbush.around(index, -119.7051, 34.4363, 1000);
```

### API

#### geokdbush.around(kdbushIndex, longitude, latitude[, maxResults, maxDistance, filterFn])

Returns an array of the closest points from a given location in order of increasing distance.

- `kdbushIndex`: [kdbush](https://github.com/mourner/kdbush) index
- `longitude`: query point longitude
- `latitude`: query point latitude
- `maxResults`: (optional) maximum number of points to return (`Infinity` by default)
- `maxDistance`: (optional) maximum distance to search within (`Infinity` by default)
- `filterFn`: (optional) a function to filter the results with
