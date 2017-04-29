"use strict";
var Image = require("ui/image").Image;
var nextId = 0;
var WenturePoint = (function () {
    // Not sure if the image works like this
    //image: Image;
    function WenturePoint(title, lat, lng) {
        this.title = title;
        this.lat = lat;
        this.lng = lng;
        this.id = nextId++;
    }
    return WenturePoint;
}());
exports.WenturePoint = WenturePoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VudHVyZXBvaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid2VudHVyZXBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBRXRDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVmO0lBRUUsd0NBQXdDO0lBQ3hDLGVBQWU7SUFFZixzQkFBbUIsS0FBYSxFQUFTLEdBQVcsRUFBUyxHQUFXO1FBQXJELFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFRO1FBQVMsUUFBRyxHQUFILEdBQUcsQ0FBUTtRQUN0RSxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUFSRCxJQVFDO0FBUlksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgSW1hZ2UgPSByZXF1aXJlKFwidWkvaW1hZ2VcIikuSW1hZ2U7XG5cbnZhciBuZXh0SWQgPSAwO1xuXG5leHBvcnQgY2xhc3MgV2VudHVyZVBvaW50IHtcbiAgaWQ6IG51bWJlcjtcbiAgLy8gTm90IHN1cmUgaWYgdGhlIGltYWdlIHdvcmtzIGxpa2UgdGhpc1xuICAvL2ltYWdlOiBJbWFnZTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdGl0bGU6IHN0cmluZywgcHVibGljIGxhdDogbnVtYmVyLCBwdWJsaWMgbG5nOiBudW1iZXIpIHtcbiAgICB0aGlzLmlkID0gbmV4dElkKys7XG4gIH1cbn1cbiJdfQ==