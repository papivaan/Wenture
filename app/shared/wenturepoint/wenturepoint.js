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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VudHVyZXBvaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid2VudHVyZXBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBRXRDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmO0lBRUUsd0NBQXdDO0lBQ3hDLGVBQWU7SUFFZixzQkFBbUIsS0FBYSxFQUFTLEdBQVcsRUFBUyxHQUFXLEVBQVMsSUFBWTtRQUExRSxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsUUFBRyxHQUFILEdBQUcsQ0FBUTtRQUFTLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQzNGLElBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQVJELElBUUM7QUFSWSxvQ0FBWSIsInNvdXJjZXNDb250ZW50IjpbInZhciBJbWFnZSA9IHJlcXVpcmUoXCJ1aS9pbWFnZVwiKS5JbWFnZTtcblxudmFyIG5leHRJZCA9IDA7XG5cbmV4cG9ydCBjbGFzcyBXZW50dXJlUG9pbnQge1xuICBpZDogbnVtYmVyO1xuICAvLyBOb3Qgc3VyZSBpZiB0aGUgaW1hZ2Ugd29ya3MgbGlrZSB0aGlzXG4gIC8vaW1hZ2U6IEltYWdlO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0aXRsZTogc3RyaW5nLCBwdWJsaWMgbGF0OiBudW1iZXIsIHB1YmxpYyBsbmc6IG51bWJlciwgcHVibGljIGluZm86IHN0cmluZykge1xuICAgIHRoaXMuaWQgPSBuZXh0SWQrKztcbiAgfVxufVxuIl19