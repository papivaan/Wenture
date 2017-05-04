"use strict";
var observable_1 = require("data/observable");
var observable_array_1 = require("data/observable-array");
var wenturepoint_1 = require("../../shared/wenturepoint/wenturepoint");
var WenturePointService = (function (_super) {
    __extends(WenturePointService, _super);
    function WenturePointService() {
        var _this = _super.call(this) || this;
        _this.points = new observable_array_1.ObservableArray([]);
        _this.populate();
        return _this;
    }
    WenturePointService.prototype.getPoints = function () {
        return this.points;
    };
    WenturePointService.prototype.populate = function () {
        this.points.push(new wenturepoint_1.WenturePoint("Dumpin toimisto", 62.232615, 25.737668, "Loistava paikka dumppareille piipahtaa pikkaselle kahville!", 0));
        this.points.push(new wenturepoint_1.WenturePoint("Kompassi", 62.242640, 25.747362, "Kohtaamispaikka keskellä kaupunkia. Jyväskylän keskipiste.", 1));
        this.points.push(new wenturepoint_1.WenturePoint("Escape", 62.243915, 25.750180, "Yökerhon eliittiä.", 0));
        this.points.push(new wenturepoint_1.WenturePoint("Yritystehdas", 62.247596, 25.741710, "Täällä rakennettaan yrittäjiä!", 1));
    };
    return WenturePointService;
}(observable_1.Observable));
exports.WenturePointService = WenturePointService;
