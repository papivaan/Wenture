"use strict";
var observable_1 = require("data/observable");
var observable_array_1 = require("data/observable-array");
var WenturePointService = (function (_super) {
    __extends(WenturePointService, _super);
    function WenturePointService() {
        var _this = _super.call(this) || this;
        _this.points = new observable_array_1.ObservableArray([
            'Mattilanniemi',
            'Kompassi',
            'Escape'
        ]);
        return _this;
    }
    WenturePointService.prototype.setPoints = function () {
        this.points.push("Kukkuu");
    };
    WenturePointService.prototype.getPoints = function () {
        return this.points;
    };
    return WenturePointService;
}(observable_1.Observable));
exports.WenturePointService = WenturePointService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VudHVyZXBvaW50LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3ZW50dXJlcG9pbnQuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsOENBQXdEO0FBQ3hELDBEQUF3RDtBQUd4RDtJQUF5Qyx1Q0FBVTtJQUdqRDtRQUFBLFlBQ0UsaUJBQU8sU0FPUjtRQUxDLEtBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxrQ0FBZSxDQUFTO1lBQ3hDLGVBQWU7WUFDZixVQUFVO1lBQ1YsUUFBUTtTQUNULENBQUMsQ0FBQzs7SUFDTCxDQUFDO0lBRUQsdUNBQVMsR0FBVDtRQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCx1Q0FBUyxHQUFUO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUVILDBCQUFDO0FBQUQsQ0FBQyxBQXJCRCxDQUF5Qyx1QkFBVSxHQXFCbEQ7QUFyQlksa0RBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT2JzZXJ2YWJsZSwgRXZlbnREYXRhIH0gZnJvbSBcImRhdGEvb2JzZXJ2YWJsZVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSBcImRhdGEvb2JzZXJ2YWJsZS1hcnJheVwiO1xuaW1wb3J0IHsgV2VudHVyZVBvaW50IH0gZnJvbSBcIi4uLy4uL3NoYXJlZC93ZW50dXJlcG9pbnQvd2VudHVyZXBvaW50XCI7XG5cbmV4cG9ydCBjbGFzcyBXZW50dXJlUG9pbnRTZXJ2aWNlIGV4dGVuZHMgT2JzZXJ2YWJsZSB7XG4gIHBvaW50czogT2JzZXJ2YWJsZUFycmF5PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnBvaW50cyA9IG5ldyBPYnNlcnZhYmxlQXJyYXk8c3RyaW5nPihbXG4gICAgICAnTWF0dGlsYW5uaWVtaScsXG4gICAgICAnS29tcGFzc2knLFxuICAgICAgJ0VzY2FwZSdcbiAgICBdKTtcbiAgfVxuXG4gIHNldFBvaW50cygpIHtcbiAgICB0aGlzLnBvaW50cy5wdXNoKFwiS3Vra3V1XCIpO1xuICB9XG5cbiAgZ2V0UG9pbnRzKCkge1xuICAgIHJldHVybiB0aGlzLnBvaW50cztcbiAgfVxuXG59XG4iXX0=