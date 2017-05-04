"use strict";
var Image = require("ui/image").Image;
var nextId = 0;
var WenturePoint = (function () {
    // Not sure if the image works like this
    //image: Image;
    function WenturePoint(title, lat, lng, info) {
        this.title = title;
        this.lat = lat;
        this.lng = lng;
        this.info = info;
        this.id = nextId++;
    }
    return WenturePoint;
}());
exports.WenturePoint = WenturePoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VudHVyZXBvaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid2VudHVyZXBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBRXRDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmO0lBRUUsd0NBQXdDO0lBQ3hDLGVBQWU7SUFFZixzQkFBbUIsS0FBYSxFQUFTLEdBQVcsRUFBUyxHQUFXLEVBQVMsSUFBWTtRQUExRSxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsUUFBRyxHQUFILEdBQUcsQ0FBUTtRQUFTLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQzNGLElBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQVJELElBUUM7QUFSWSxvQ0FBWSIsInNvdXJjZXNDb250ZW50IjpbInZhciBJbWFnZSA9IHJlcXVpcmUoXCJ1aS9pbWFnZVwiKS5JbWFnZTtcclxuXHJcbnZhciBuZXh0SWQgPSAwO1xyXG5cclxuZXhwb3J0IGNsYXNzIFdlbnR1cmVQb2ludCB7XHJcbiAgaWQ6IG51bWJlcjtcclxuICAvLyBOb3Qgc3VyZSBpZiB0aGUgaW1hZ2Ugd29ya3MgbGlrZSB0aGlzXHJcbiAgLy9pbWFnZTogSW1hZ2U7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0aXRsZTogc3RyaW5nLCBwdWJsaWMgbGF0OiBudW1iZXIsIHB1YmxpYyBsbmc6IG51bWJlciwgcHVibGljIGluZm86IHN0cmluZykge1xyXG4gICAgdGhpcy5pZCA9IG5leHRJZCsrO1xyXG4gIH1cclxufVxyXG4iXX0=