"use strict";
var WenturePointService = (function () {
    function WenturePointService() {
        this.list = [1, 2, 666];
    }
    WenturePointService.prototype.setPoints = function () {
        this.list.push(1);
    };
    WenturePointService.prototype.getPoints = function () {
        return this.list;
    };
    return WenturePointService;
}());
exports.WenturePointService = WenturePointService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VudHVyZXBvaW50LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3ZW50dXJlcG9pbnQuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBS0E7SUFHRTtRQUZBLFNBQUksR0FBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRWxCLENBQUM7SUFFakIsdUNBQVMsR0FBVDtRQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFRCx1Q0FBUyxHQUFUO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVILDBCQUFDO0FBQUQsQ0FBQyxBQWJELElBYUM7QUFiWSxrREFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgb2JzZXJ2YWJsZUFycmF5TW9kdWxlID0gcmVxdWlyZShcImRhdGEvb2JzZXJ2YWJsZS1hcnJheVwiKTtcclxuaW1wb3J0IHsgV2VudHVyZVBvaW50IH0gZnJvbSBcIi4uLy4uL3NoYXJlZC93ZW50dXJlcG9pbnQvd2VudHVyZXBvaW50XCI7XHJcblxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBXZW50dXJlUG9pbnRTZXJ2aWNlIHtcclxuICBsaXN0OiBBcnJheTxudW1iZXI+ID0gWzEsIDIsIDY2Nl07XHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHt9XHJcblxyXG4gIHNldFBvaW50cygpIHtcclxuICAgIHRoaXMubGlzdC5wdXNoKDEpO1xyXG4gIH1cclxuXHJcbiAgZ2V0UG9pbnRzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubGlzdDtcclxuICB9XHJcblxyXG59XHJcbiJdfQ==