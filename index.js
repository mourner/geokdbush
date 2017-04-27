'use strict';

var tinyqueue = require('tinyqueue');

exports.around = around;
exports.distance = distance;

var earthRadius = 6371;
var earthCircumference = 40007;

var rad = Math.PI / 180;

function around(index, lng, lat, maxResults, maxDistance, predicate) {
    var result = [];

    if (maxResults === undefined) maxResults = Infinity;
    if (maxDistance === undefined) maxDistance = Infinity;

    var cosLat = Math.cos(lat * rad);
    var sinLat = Math.sin(lat * rad);

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
        var right = node.right;
        var left = node.left;

        if (right - left <= index.nodeSize) { // leaf node

            // add all points of the leaf node to the queue
            for (var i = left; i <= right; i++) {
                var item = index.points[index.ids[i]];
                if (!predicate || predicate(item)) {
                    q.push({
                        item: item,
                        dist: greatCircleDist(lng, lat, index.coords[2 * i], index.coords[2 * i + 1], cosLat, sinLat)
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
                q.push({
                    item: item,
                    dist: greatCircleDist(lng, lat, midLng, midLat, cosLat, sinLat)
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

            leftNode.dist = boxDist(lng, lat, leftNode, cosLat, sinLat);
            rightNode.dist = boxDist(lng, lat, rightNode, cosLat, sinLat);

            // add child nodes to the queue
            q.push(leftNode);
            q.push(rightNode);
        }

        // fetch closest points from the queue; they're guaranteed to be closer
        // than all remaining points (both individual and those in kd-tree nodes),
        // since each node's distance is a lower bound of distances to its children
        while (q.length && q.peek().item) {
            var candidate = q.pop();
            if (candidate.dist > maxDistance) return result;
            result.push(candidate.item);
            if (result.length === maxResults) return result;
        }

        // the next closest kd-tree node
        node = q.pop();
    }

    return result;
}

// lower bound for distance from a location to points inside a bounding box
function boxDist(lng, lat, node, cosLat, sinLat) {
    var minLng = node.minLng;
    var maxLng = node.maxLng;
    var minLat = node.minLat;
    var maxLat = node.maxLat;

    // query point is between minimum and maximum longitudes
    if (lng >= minLng && lng <= maxLng) {
        if (lat <= minLat) return earthCircumference * (minLat - lat) / 360; // south
        if (lat >= maxLat) return earthCircumference * (lat - maxLat) / 360; // north
        return 0; // inside the bbox
    }

    // query point is west or east of the bounding box;
    // calculate the extremum for great circle distance from query point to the closest longitude
    var closestLng = (minLng - lng + 360) % 360 <= (lng - maxLng + 360) % 360 ? minLng : maxLng;
    var cosLngDelta = Math.cos((closestLng - lng) * rad);
    var extremumLat = Math.atan(sinLat / (cosLat * cosLngDelta)) / rad;

    // calculate distances to lower and higher bbox corners and extremum (if it's within this range);
    // one of the three distances will be the lower bound of great circle distance to bbox
    var d = Math.max(
        greatCircleDistPart(minLat, cosLat, sinLat, cosLngDelta),
        greatCircleDistPart(maxLat, cosLat, sinLat, cosLngDelta));

    if (extremumLat > minLat && extremumLat < maxLat) {
        d = Math.max(d, greatCircleDistPart(extremumLat, cosLat, sinLat, cosLngDelta));
    }

    return earthRadius * Math.acos(d);
}

function compareDist(a, b) {
    return a.dist - b.dist;
}

// distance using spherical law of cosines; should be precise enough for our needs
function greatCircleDist(lng, lat, lng2, lat2, cosLat, sinLat) {
    var cosLngDelta = Math.cos((lng2 - lng) * rad);
    return earthRadius * Math.acos(greatCircleDistPart(lat2, cosLat, sinLat, cosLngDelta));
}

// partial greatCircleDist to reduce trigonometric calculations
function greatCircleDistPart(lat, cosLat, sinLat, cosLngDelta) {
    var d = sinLat * Math.sin(lat * rad) +
            cosLat * Math.cos(lat * rad) * cosLngDelta;
    return Math.min(d, 1);
}

function distance(lng, lat, lng2, lat2) {
    return greatCircleDist(lng, lat, lng2, lat2, Math.cos(lat * rad), Math.sin(lat * rad));
}
