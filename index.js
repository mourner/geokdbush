'use strict';

var tinyqueue = require('tinyqueue');

exports.around = around;

var earthRadius = 6371;
var rad = Math.PI / 180;

function around(index, lng, lat, maxResults, maxDistance, predicate) {
    var result = [];

    if (maxResults === undefined) maxResults = Infinity;
    if (maxDistance === undefined) maxDistance = Infinity;

    var cosLat = Math.cos(lat * rad);

    var node = {
        left: 0,
        right: index.ids.length - 1,
        axis: 0,
        dist: Infinity,
        minLng: -180,
        minLat: -90,
        maxLng: 180,
        maxLat: 90
    };

    var q = tinyqueue(null, compareDist);

    while (node) {
        var axis = node.axis;
        var right = node.right;
        var left = node.left;

        if (right - left <= index.nodeSize) {
            // add all points in a leaf node to the queue
            for (var i = left; i <= right; i++) {
                var item = index.points[index.ids[i]];
                if (!predicate || predicate(item)) {
                    q.push({
                        item: item,
                        dist: harvesineDist(lng, lat, index.coords[2 * i], index.coords[2 * i + 1], cosLat)
                    });
                }
            }

        } else {
            var m = (left + right) >> 1;

            var midLng = index.coords[2 * m];
            var midLat = index.coords[2 * m + 1];

            // add middle point to the queue
            item = index.points[index.ids[m]];
            if (!predicate || predicate(item)) {
                q.push({
                    item: item,
                    dist: harvesineDist(lng, lat, midLng, midLat, cosLat)
                });
            }

            var nextAxis = (axis + 1) % 2;

            var leftNode = {
                left: left,
                right: m - 1,
                axis: nextAxis,
                minLng: node.minLng,
                minLat: node.minLat,
                maxLng: axis === 0 ? midLng : node.maxLng,
                maxLat: axis === 1 ? midLat : node.maxLat,
                dist: 0
            };
            var rightNode = {
                left: m + 1,
                right: right,
                axis: nextAxis,
                minLng: axis === 0 ? midLng : node.minLng,
                minLat: axis === 1 ? midLat : node.minLat,
                maxLng: node.maxLng,
                maxLat: node.maxLat,
                dist: 0
            };

            leftNode.dist = boxDist(lng, lat, leftNode, cosLat);
            rightNode.dist = boxDist(lng, lat, rightNode, cosLat);

            q.push(leftNode);
            q.push(rightNode);
        }

        while (q.length && q.peek().item) {
            var candidate = q.pop();
            if (candidate.dist > maxDistance) return result;
            result.push(candidate.item);
            if (result.length === maxResults) return result;
        }

        node = q.pop();
    }

    return result;
}

// Manhattan-like distance measure from a location to a bounding box
function boxDist(lng, lat, node, cosLat) {
    var dx = earthRadius * spanDist(lng, node.minLng, node.maxLng, 360) * cosLat;
    var dy = earthRadius * spanDist(lat, node.minLat, node.maxLat, 180);
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

function harvesineDist(lng1, lat1, lng2, lat2, cosLat1) {
    var d = Math.sin(lat1 * rad) * Math.sin(lat2 * rad) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos((lng2 - lng1) * rad);
    return earthRadius * Math.acos(Math.min(d, 1));
}
