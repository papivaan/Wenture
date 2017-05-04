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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VudHVyZXBvaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid2VudHVyZXBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBRXRDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmO0lBRUUsd0NBQXdDO0lBQ3hDLGVBQWU7SUFFZixzQkFBbUIsS0FBYSxFQUFTLEdBQVcsRUFBUyxHQUFXLEVBQVMsSUFBWSxFQUFTLE9BQWU7UUFBbEcsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFTLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFRO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDbkgsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBUkQsSUFRQztBQVJZLG9DQUFZIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEltYWdlID0gcmVxdWlyZShcInVpL2ltYWdlXCIpLkltYWdlO1xyXG5cclxudmFyIG5leHRJZCA9IDA7XHJcblxyXG5leHBvcnQgY2xhc3MgV2VudHVyZVBvaW50IHtcclxuICBpZDogbnVtYmVyO1xyXG4gIC8vIE5vdCBzdXJlIGlmIHRoZSBpbWFnZSB3b3JrcyBsaWtlIHRoaXNcclxuICAvL2ltYWdlOiBJbWFnZTtcclxuXHJcbiAgY29uc3RydWN0b3IocHVibGljIHRpdGxlOiBzdHJpbmcsIHB1YmxpYyBsYXQ6IG51bWJlciwgcHVibGljIGxuZzogbnVtYmVyLCBwdWJsaWMgaW5mbzogc3RyaW5nLCBwdWJsaWMgcHJpemVJZDogbnVtYmVyKSB7XHJcbiAgICB0aGlzLmlkID0gbmV4dElkKys7XHJcbiAgfVxyXG59XHJcbiJdfQ==