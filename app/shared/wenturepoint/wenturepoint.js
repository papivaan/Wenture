"use strict";
var Image = require("ui/image").Image;
var nextId = 0;
var WenturePoint = (function () {
    // Not sure if the image works like this
    //image: Image;
    function WenturePoint(title, lat, lng, info, prizeId) {
        this.title = title;
        this.lat = lat;
        this.lng = lng;
        this.info = info;
        this.prizeId = prizeId;
        this.id = nextId++;
    }
    return WenturePoint;
}());
exports.WenturePoint = WenturePoint;
