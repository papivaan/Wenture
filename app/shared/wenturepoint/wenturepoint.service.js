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
        this.points.push(new wenturepoint_1.WenturePoint("Mattilanniemi", 62.24, 25.75));
    };
    return WenturePointService;
}(observable_1.Observable));
exports.WenturePointService = WenturePointService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VudHVyZXBvaW50LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3ZW50dXJlcG9pbnQuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsOENBQXdEO0FBQ3hELDBEQUF3RDtBQUN4RCx1RUFBc0U7QUFFdEU7SUFBeUMsdUNBQVU7SUFHakQ7UUFBQSxZQUNFLGlCQUFPLFNBSVI7UUFGQyxLQUFJLENBQUMsTUFBTSxHQUFHLElBQUksa0NBQWUsQ0FBZSxFQUFHLENBQUMsQ0FBQztRQUNyRCxLQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7O0lBQ2xCLENBQUM7SUFFRCx1Q0FBUyxHQUFUO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUVELHNDQUFRLEdBQVI7UUFDRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDZCxJQUFJLDJCQUFZLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FDaEQsQ0FBQztJQUNKLENBQUM7SUFFSCwwQkFBQztBQUFELENBQUMsQUFwQkQsQ0FBeUMsdUJBQVUsR0FvQmxEO0FBcEJZLGtEQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUsIEV2ZW50RGF0YSB9IGZyb20gXCJkYXRhL29ic2VydmFibGVcIjtcbmltcG9ydCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gXCJkYXRhL29ic2VydmFibGUtYXJyYXlcIjtcbmltcG9ydCB7IFdlbnR1cmVQb2ludCB9IGZyb20gXCIuLi8uLi9zaGFyZWQvd2VudHVyZXBvaW50L3dlbnR1cmVwb2ludFwiO1xuXG5leHBvcnQgY2xhc3MgV2VudHVyZVBvaW50U2VydmljZSBleHRlbmRzIE9ic2VydmFibGUge1xuICBwb2ludHM6IE9ic2VydmFibGVBcnJheTxXZW50dXJlUG9pbnQ+O1xuXG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5wb2ludHMgPSBuZXcgT2JzZXJ2YWJsZUFycmF5PFdlbnR1cmVQb2ludD4oWyBdKTtcbiAgICB0aGlzLnBvcHVsYXRlKCk7XG4gIH1cblxuICBnZXRQb2ludHMoKSB7XG4gICAgcmV0dXJuIHRoaXMucG9pbnRzO1xuICB9XG5cbiAgcG9wdWxhdGUoKSB7XG4gICAgdGhpcy5wb2ludHMucHVzaChcbiAgICAgIG5ldyBXZW50dXJlUG9pbnQoXCJNYXR0aWxhbm5pZW1pXCIsIDYyLjI0LCAyNS43NSlcbiAgICApO1xuICB9XG5cbn1cbiJdfQ==