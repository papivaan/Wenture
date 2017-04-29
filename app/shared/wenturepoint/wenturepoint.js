"use strict";
var Image = require("ui/image").Image;
var WenturePoint = (function () {
    // Not sure if the image works like this
    //image: Image;
    function WenturePoint(titlename, latitude, longitude) {
        this.titlename = titlename;
        this.latitude = latitude;
        this.longitude = longitude;
        this.nextId = 0;
        this.id = this.nextId++;
        this.title = titlename;
        this.lat = latitude;
        this.lng = longitude;
    }
    return WenturePoint;
}());
exports.WenturePoint = WenturePoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VudHVyZXBvaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid2VudHVyZXBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBRXRDO0lBT0Usd0NBQXdDO0lBQ3hDLGVBQWU7SUFFZixzQkFBbUIsU0FBaUIsRUFBUyxRQUFnQixFQUFTLFNBQWlCO1FBQXBFLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUp2RixXQUFNLEdBQUcsQ0FBQyxDQUFDO1FBS1QsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUM7UUFDcEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUM7SUFDdkIsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQWhCRCxJQWdCQztBQWhCWSxvQ0FBWSIsInNvdXJjZXNDb250ZW50IjpbInZhciBJbWFnZSA9IHJlcXVpcmUoXCJ1aS9pbWFnZVwiKS5JbWFnZTtcblxuZXhwb3J0IGNsYXNzIFdlbnR1cmVQb2ludCB7XG4gIGlkOiBudW1iZXI7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHNuaXBwZXQ6IHN0cmluZztcbiAgbGF0OiBudW1iZXI7XG4gIGxuZzogbnVtYmVyO1xuICBuZXh0SWQgPSAwO1xuICAvLyBOb3Qgc3VyZSBpZiB0aGUgaW1hZ2Ugd29ya3MgbGlrZSB0aGlzXG4gIC8vaW1hZ2U6IEltYWdlO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0aXRsZW5hbWU6IHN0cmluZywgcHVibGljIGxhdGl0dWRlOiBudW1iZXIsIHB1YmxpYyBsb25naXR1ZGU6IG51bWJlcikge1xuICAgIHRoaXMuaWQgPSB0aGlzLm5leHRJZCsrO1xuICAgIHRoaXMudGl0bGUgPSB0aXRsZW5hbWU7XG4gICAgdGhpcy5sYXQgPSBsYXRpdHVkZTtcbiAgICB0aGlzLmxuZyA9IGxvbmdpdHVkZTtcbiAgfVxufVxuIl19