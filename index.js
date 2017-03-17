'use strict';

var tinyqueue = require('tinyqueue');

exports.around = around;

var earthRadius = 6371;
var earthCircumference = 40007;

var rad = Math.PI / 180;

function around(index, lng, lat, maxResults, maxDistance, predicate) {
    var result = [];

    if (maxResults === undefined) maxResults = Infinity;
    if (maxDistance === undefined) maxDistance = Infinity;

    var cosLat = Math.cos(lat * rad);

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
                        dist: greatCircleDist(lng, lat, index.coords[2 * i], index.coords[2 * i + 1], cosLat)
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
                    dist: greatCircleDist(lng, lat, midLng, midLat, cosLat)
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

            leftNode.dist = boxDist(lng, lat, leftNode, cosLat);
            rightNode.dist = boxDist(lng, lat, rightNode, cosLat);

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
function boxDist(lng, lat, node, cosLat) {
    var dx = 0.7 * (earthCircumference / 360) * spanDist(lng, node.minLng, node.maxLng, 360) * cosLat;
    var dy = 0.7 * (earthCircumference / 360) * spanDist(lat, node.minLat, node.maxLat, 180);
    // we use Chebyshev's distance metric, which is fast and good enough
    return Math.max(dx, dy);
}

function spanDist(k, min, max, span) {
    if (k >= min && k <= max) return 0;
    return Math.min(
        axisDist(k, min, span),
        axisDist(k, max, span));
}

function axisDist(a, b, span) {
    return Math.min(
        Math.abs(a - b),
        Math.abs(a - b + span),
        Math.abs(a - b - span));
}

function compareDist(a, b) {
    return a.dist - b.dist;
}

// distance using spherical law of cosines; should be precise enough for our needs
function greatCircleDist(lng1, lat1, lng2, lat2, cosLat1) {
    var d = Math.sin(lat1 * rad) * Math.sin(lat2 * rad) +
            cosLat1 * Math.cos(lat2 * rad) * Math.cos((lng2 - lng1) * rad);
    return earthRadius * Math.acos(Math.min(d, 1));
}
