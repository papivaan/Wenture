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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VudHVyZXBvaW50LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3ZW50dXJlcG9pbnQuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBS0E7SUFHRTtRQUZBLFNBQUksR0FBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRWxCLENBQUM7SUFFakIsdUNBQVMsR0FBVDtRQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFRCx1Q0FBUyxHQUFUO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVILDBCQUFDO0FBQUQsQ0FBQyxBQWJELElBYUM7QUFiWSxrREFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgb2JzZXJ2YWJsZUFycmF5TW9kdWxlID0gcmVxdWlyZShcImRhdGEvb2JzZXJ2YWJsZS1hcnJheVwiKTtcbmltcG9ydCB7IFdlbnR1cmVQb2ludCB9IGZyb20gXCIuLi8uLi9zaGFyZWQvd2VudHVyZXBvaW50L3dlbnR1cmVwb2ludFwiO1xuXG5cblxuZXhwb3J0IGNsYXNzIFdlbnR1cmVQb2ludFNlcnZpY2Uge1xuICBsaXN0OiBBcnJheTxudW1iZXI+ID0gWzEsIDIsIDY2Nl07XG5cbiAgY29uc3RydWN0b3IgKCkge31cblxuICBzZXRQb2ludHMoKSB7XG4gICAgdGhpcy5saXN0LnB1c2goMSk7XG4gIH1cblxuICBnZXRQb2ludHMoKSB7XG4gICAgcmV0dXJuIHRoaXMubGlzdDtcbiAgfVxuXG59XG4iXX0=