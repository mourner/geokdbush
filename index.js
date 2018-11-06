'use strict';

var tinyqueue = require('tinyqueue');

exports.around = around;
exports.distance = distance;

var earthRadius = 6371;
var rad = Math.PI / 180;

function around(index, lng, lat, maxResults, maxDistance, predicate) {
    var maxHaverSinDist = 1, result = [];

    if (maxResults === undefined) maxResults = Infinity;
    if (maxDistance !== undefined) maxHaverSinDist = haverSin(maxDistance/earthRadius);

    // a distance-sorted priority queue that will contain both points and kd-tree nodes
    var q = tinyqueue(null, compareDist);

    // an object that represents the top kd-tree node (the whole Earth)
    var node = {
        left: 0, // left index in the kd-tree array
        right: index.ids.length - 1, // right index
        axis: 0, // 0 for longitude axis and 1 for latitude axis
        dist: 0, // will hold the lower bound of children's distances to the query point
        minLng: -180, // bounding box of the node
        minLat: -90,
        maxLng: 180,
        maxLat: 90
    };

    while (node) {
        var item, haverSinDLng;
        var right = node.right;
        var left = node.left;

        if (right - left <= index.nodeSize) { // leaf node

            // add all points of the leaf node to the queue
            for (var i = left; i <= right; i++) {
                item = index.points[index.ids[i]];
                if (!predicate || predicate(item)) {
                    haverSinDLng = haverSin((lng - index.coords[2 * i]) * rad);
                    q.push({
                        item: item,
                        dist: haverSinDist(haverSinDLng, lat, index.coords[2 * i + 1])
                    });
                }
            }

        } else { // not a leaf node (has child nodes)

            var m = (left + right) >> 1; // middle index
            var midLng = index.coords[2 * m];
            var midLat = index.coords[2 * m + 1];

            // add middle point to the queue
            item = index.points[index.ids[m]];
            if (!predicate || predicate(item)) {
                haverSinDLng = haverSin((lng - midLng) * rad);
                q.push({
                    item: item,
                    dist: haverSinDist(haverSinDLng, lat, midLat)
                });
            }

            var nextAxis = (node.axis + 1) % 2;

            // first half of the node
            var leftNode = {
                left: left,
                right: m - 1,
                axis: nextAxis,
                minLng: node.minLng,
                minLat: node.minLat,
                maxLng: node.axis === 0 ? midLng : node.maxLng,
                maxLat: node.axis === 1 ? midLat : node.maxLat,
                dist: 0
            };
            // second half of the node
            var rightNode = {
                left: m + 1,
                right: right,
                axis: nextAxis,
                minLng: node.axis === 0 ? midLng : node.minLng,
                minLat: node.axis === 1 ? midLat : node.minLat,
                maxLng: node.maxLng,
                maxLat: node.maxLat,
                dist: 0
            };

            leftNode.dist = boxDist(lng, lat, leftNode);
            rightNode.dist = boxDist(lng, lat, rightNode);

            // add child nodes to the queue
            q.push(leftNode);
            q.push(rightNode);
        }

        // fetch closest points from the queue; they're guaranteed to be closer
        // than all remaining points (both individual and those in kd-tree nodes),
        // since each node's distance is a lower bound of distances to its children
        while (q.length && q.peek().item) {
            var candidate = q.pop();
            if (candidate.dist > maxHaverSinDist) return result;
            result.push(candidate.item);
            if (result.length === maxResults) return result;
        }

        // the next closest kd-tree node
        node = q.pop();
    }

    return result;
}

// lower bound for distance from a location to points inside a bounding box
function boxDist(lng, lat, node) {
    var minLng = node.minLng;
    var maxLng = node.maxLng;
    var minLat = node.minLat;
    var maxLat = node.maxLat;

    // query point is between minimum and maximum longitudes
    if (lng >= minLng && lng <= maxLng) {
        var dLat = (lat < minLat)?(lat - minLat):((lat > maxLat)?(lat - maxLat):0);
        return haverSin(dLat * rad);
    }

    // query point is west or east of the bounding box;
    // calculate the extremum for great circle distance from query point to the closest longitude
    // calculate distances to lower and higher bbox corners and extremum (if it's within this range);
    // one of the three distances will be the lower bound of great circle distance to bbox
    var haverSinDLng = Math.min(haverSin((lng - minLng) * rad), haverSin((lng - maxLng) * rad));
    var extremumLat = vertexLat(lat, haverSinDLng);
    if (extremumLat > minLat && extremumLat < maxLat) {
        return haverSinDist(haverSinDLng, lat, extremumLat);
    }
    return Math.min(
        haverSinDist(haverSinDLng, lat, minLat),
        haverSinDist(haverSinDLng, lat, maxLat)
    );
}

function compareDist(a, b) {
    return a.dist - b.dist;
}

function haverSin(theta) {
    var s = Math.sin(theta / 2);
    return s * s;
}

function haverSinDist(haverSinDLng, lat1, lat2) {
    var haverSinDLat = haverSin((lat1 - lat2) * rad);
    return haverSinDLng * Math.cos(lat1 * rad) * Math.cos(lat2 * rad) + haverSinDLat;
}

function greatCircleDist(lng1, lat1, lng2, lat2) {
    var haverSinDLng = haverSin((lng1 - lng2) * rad);
    var hsdist = haverSinDist(haverSinDLng, lat1, lat2);
    return 2*earthRadius*Math.asin(Math.sqrt(hsdist));
}

function distance(lng, lat, lng2, lat2) {
    return greatCircleDist(lng1, lat1, lng2, lat2);
}

function vertexLat(lat, haverSinDLng) {
    var cosDLng = 1 - 2 * haverSinDLng;
    if (cosDLng <= 0) return (lat>0?90:-90);
    return Math.atan(Math.tan(lat * rad) / cosDLng) / rad;
}
