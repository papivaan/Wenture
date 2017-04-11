"use strict";
var core_1 = require("@angular/core");
var element_registry_1 = require("nativescript-angular/element-registry");
var geolocation = require("nativescript-geolocation");
var color_1 = require("color");
var mapsModule = require("nativescript-google-maps-sdk");
var watchId;
var currentPosition;
//var _currentPosition: any;
element_registry_1.registerElement("MapView", function () { return require("nativescript-google-maps-sdk").MapView; });
var MapPageComponent = (function () {
    function MapPageComponent() {
        //Map events
        this.onMapReady = function (event) {
            console.log("Map Ready");
            startWatch(event);
            // Check if location services are enabled
            if (!geolocation.isEnabled()) {
                geolocation.enableLocationRequest();
            }
            else
                console.log("Alles in Ordnung");
            var mapView = event.object;
            var gMap = mapView.gMap;
            var marker = new mapsModule.Marker();
            marker.position = mapsModule.Position.positionFromLatLng(62.2308912, 25.7343853);
            marker.title = "Mattilanniemi";
            marker.snippet = "University Campus";
            marker.userData = { index: 1 };
            mapView.addMarker(marker);
            /*
                var circle = new mapsModule.Circle();
                circle.center = mapsModule.Position.positionFromLatLng(62.23, 25.73);
                circle.visible = true;
                circle.radius = 50;
                circle.fillColor = new Color('#99ff8800');
                circle.strokeColor = new Color('#99ff0000');
                circle.strokeWidth = 2;
                mapView.addCircle(circle);
            */
        };
        this.onCoordinateLongPress = function (event) {
            console.log("LongPress");
            var mapView = event.object;
            var lat = event.position.latitude;
            var lng = event.position.longitude;
            console.log("Tapped location: \n\tLatitude: " + event.position.latitude +
                "\n\tLongitude: " + event.position.longitude);
            var marker = new mapsModule.Marker();
            marker.position = mapsModule.Position.positionFromLatLng(lat, lng);
            marker.title = "Mattilanniemi";
            marker.snippet = "University Campus";
            marker.userData = { index: 1 };
            mapView.addMarker(marker);
        };
        this.onMarkerSelect = function (event) {
            console.log("MarkerSelect: " + event.marker.title
                + "\n\tPosition: " + JSON.stringify(event.marker.position));
            // TODO: Tämä on jostain syystä undefined. This:llä varmaan väärä scope.
            //let currentPos = JSON.stringify(this._currentPosition);
            var currentPos = JSON.stringify(currentPosition);
            console.log("Current position: " + currentPos);
            var markerPos = JSON.stringify(event.marker.position);
            console.log("Marker position: " + markerPos);
            var distance = geolocation.distance(JSON.parse(currentPos), JSON.parse(markerPos));
            console.log("Distance to marker: " + distance);
        };
        this.onMarkerBeginDragging = function (event) {
            console.log("MarkerBeginDragging");
        };
        this.onMarkerEndDragging = function (event) {
            console.log("MarkerEndDragging");
        };
        this.onMarkerDrag = function (event) {
            console.log("MarkerDrag");
        };
        this.onCameraChanged = function (event) {
            console.log("CameraChange");
        };
    }
    MapPageComponent.prototype.ngOnInit = function () {
        // TODO: Loader
        //this.startWatch();
    };
    return MapPageComponent;
}());
__decorate([
    core_1.ViewChild("MapView"),
    __metadata("design:type", core_1.ElementRef)
], MapPageComponent.prototype, "mapView", void 0);
MapPageComponent = __decorate([
    core_1.Component({
        selector: "map-page",
        templateUrl: "pages/map-page/map-page.html",
        styleUrls: ["pages/map-page/map-page-common.css", "pages/map-page/map-page.css"]
    })
], MapPageComponent);
exports.MapPageComponent = MapPageComponent;
function startWatch(event) {
    var mapView = event.object;
    watchId = geolocation.watchLocation(function (loc) {
        if (loc) {
            var obj = JSON.parse(JSON.stringify(loc));
            this.latitude = obj.latitude;
            this.longitude = obj.longitude;
            this.altitude = obj.altitude;
            /*var*/ currentPosition = mapsModule.Position.positionFromLatLng(obj.latitude, obj.longitude);
            console.log(new Date() + "\nReceived location:\n\tLatitude: " + obj.latitude
                + "\n\tLongitude: " + obj.longitude
                + "\n\tAltitude: " + obj.altitude
                + "\n\tTimestamp: " + obj.timestamp
                + "\n\tDirection: " + obj.direction
                + "\n\nCurrentPos: " + JSON.stringify(currentPosition));
            var circle = new mapsModule.Circle();
            circle.center = mapsModule.Position.positionFromLatLng(this.latitude, this.longitude);
            circle.visible = true;
            circle.radius = 20;
            circle.fillColor = new color_1.Color('#6c9df0'); //#99ff8800
            circle.strokeColor = new color_1.Color('#396abd'); //#99ff0000
            circle.strokeWidth = 2;
            mapView.addCircle(circle);
            mapView.latitude = this.latitude;
            mapView.longitude = this.longitude;
        }
    }, function (e) {
        console.log("Error: " + e.message);
    }, { desiredAccuracy: 3, updateDistance: 10, minimumUpdateTime: 1000 * 2 });
}
exports.startWatch = startWatch;
function endWatch() {
    if (watchId) {
        geolocation.clearWatch(watchId);
        console.log("My watch is ended... T. Jon Snow");
    }
}
exports.endWatch = endWatch;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBeUU7QUFDekUsMEVBQXNFO0FBQ3RFLHNEQUF3RDtBQUN4RCwrQkFBOEI7QUFFOUIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFFekQsSUFBSSxPQUFZLENBQUM7QUFDakIsSUFBSSxlQUFvQixDQUFDO0FBQ3pCLDRCQUE0QjtBQUU1QixrQ0FBZSxDQUFDLFNBQVMsRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsT0FBTyxFQUEvQyxDQUErQyxDQUFDLENBQUM7QUFxQmxGLElBQWEsZ0JBQWdCO0lBbkI3QjtRQWdDRSxZQUFZO1FBQ1osZUFBVSxHQUFHLFVBQUMsS0FBSztZQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3pCLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVsQix5Q0FBeUM7WUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixXQUFXLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUN4QyxDQUFDO1lBQUMsSUFBSTtnQkFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFdkMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUMzQixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBRXhCLElBQUksTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDakYsTUFBTSxD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SSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ1YsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztBQUNMLENBQUM7QUFMRCw0QkFLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtyZWdpc3RlckVsZW1lbnR9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9lbGVtZW50LXJlZ2lzdHJ5XCI7XG5pbXBvcnQgKiBhcyBnZW9sb2NhdGlvbiBmcm9tIFwibmF0aXZlc2NyaXB0LWdlb2xvY2F0aW9uXCI7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCJjb2xvclwiO1xuXG52YXIgbWFwc01vZHVsZSA9IHJlcXVpcmUoXCJuYXRpdmVzY3JpcHQtZ29vZ2xlLW1hcHMtc2RrXCIpO1xuXG52YXIgd2F0Y2hJZDogYW55O1xudmFyIGN1cnJlbnRQb3NpdGlvbjogYW55O1xuLy92YXIgX2N1cnJlbnRQb3NpdGlvbjogYW55O1xuXG5yZWdpc3RlckVsZW1lbnQoXCJNYXBWaWV3XCIsICgpID0+IHJlcXVpcmUoXCJuYXRpdmVzY3JpcHQtZ29vZ2xlLW1hcHMtc2RrXCIpLk1hcFZpZXcpO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6IFwibWFwLXBhZ2VcIixcbiAgdGVtcGxhdGVVcmw6IFwicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UuaHRtbFwiLFxuICBzdHlsZVVybHM6IFtcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLWNvbW1vbi5jc3NcIiwgXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS5jc3NcIl1cbn0pXG5cbi8qZXhwb3J0IGZ1bmN0aW9uIHB1YmxpYyBzdGFydFdhdGNoKCkge1xuICAgIHZhciB3YXRjaElkID0gZ2VvbG9jYXRpb24ud2F0Y2hMb2NhdGlvbihcbiAgICBmdW5jdGlvbiAobG9jKSB7XG4gICAgICAgIGlmIChsb2MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVjZWl2ZWQgbG9jYXRpb246IFwiICsgbG9jKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZnVuY3Rpb24oZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgZS5tZXNzYWdlKTtcbiAgICB9LFxuICAgIHtkZXNpcmVkQWNjdXJhY3k6IDMsIHVwZGF0ZURpc3RhbmNlOiAxMCwgbWluaW11bVVwZGF0ZVRpbWUgOiAxMDAwICogMjB9KTsgLy8gU2hvdWxkIHVwZGF0ZSBldmVyeSAyMCBzZWNvbmRzIGFjY29yZGluZyB0byBHb29nZSBkb2N1bWVudGF0aW9uLiBOb3QgdmVyaWZpZWQuXG59Ki9cblxuZXhwb3J0IGNsYXNzIE1hcFBhZ2VDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBAVmlld0NoaWxkKFwiTWFwVmlld1wiKSBtYXBWaWV3OiBFbGVtZW50UmVmO1xuXG4gIGxhdGl0dWRlOiBudW1iZXI7XG4gIGxvbmdpdHVkZTogbnVtYmVyO1xuICBhbHRpdHVkZTogbnVtYmVyO1xuICBfY3VycmVudFBvc2l0aW9uOiBhbnk7XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gVE9ETzogTG9hZGVyXG4gICAgLy90aGlzLnN0YXJ0V2F0Y2goKTtcbiAgfVxuXG4gIC8vTWFwIGV2ZW50c1xuICBvbk1hcFJlYWR5ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXAgUmVhZHlcIik7XG4gICAgc3RhcnRXYXRjaChldmVudCk7XG5cbiAgICAvLyBDaGVjayBpZiBsb2NhdGlvbiBzZXJ2aWNlcyBhcmUgZW5hYmxlZFxuICAgIGlmICghZ2VvbG9jYXRpb24uaXNFbmFibGVkKCkpIHtcbiAgICAgICAgZ2VvbG9jYXRpb24uZW5hYmxlTG9jYXRpb25SZXF1ZXN0KCk7XG4gICAgfSBlbHNlIGNvbnNvbGUubG9nKFwiQWxsZXMgaW4gT3JkbnVuZ1wiKTtcblxuICAgIHZhciBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xuICAgIHZhciBnTWFwID0gbWFwVmlldy5nTWFwO1xuXG4gICAgdmFyIG1hcmtlciA9IG5ldyBtYXBzTW9kdWxlLk1hcmtlcigpO1xuICAgIG1hcmtlci5wb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKDYyLjIzMDg5MTIsIDI1LjczNDM4NTMpO1xuICAgIG1hcmtlci50aXRsZSA9IFwiTWF0dGlsYW5uaWVtaVwiO1xuICAgIG1hcmtlci5zbmlwcGV0ID0gXCJVbml2ZXJzaXR5IENhbXB1c1wiO1xuICAgIG1hcmtlci51c2VyRGF0YSA9IHtpbmRleDogMX07XG4gICAgbWFwVmlldy5hZGRNYXJrZXIobWFya2VyKTtcbi8qXG4gICAgdmFyIGNpcmNsZSA9IG5ldyBtYXBzTW9kdWxlLkNpcmNsZSgpO1xuICAgIGNpcmNsZS5jZW50ZXIgPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyg2Mi4yMywgMjUuNzMpO1xuICAgIGNpcmNsZS52aXNpYmxlID0gdHJ1ZTtcbiAgICBjaXJjbGUucmFkaXVzID0gNTA7XG4gICAgY2lyY2xlLmZpbGxDb2xvciA9IG5ldyBDb2xvcignIzk5ZmY4ODAwJyk7XG4gICAgY2lyY2xlLnN0cm9rZUNvbG9yID0gbmV3IENvbG9yKCcjOTlmZjAwMDAnKTtcbiAgICBjaXJjbGUuc3Ryb2tlV2lkdGggPSAyO1xuICAgIG1hcFZpZXcuYWRkQ2lyY2xlKGNpcmNsZSk7XG4qL1xuICB9O1xuXG4gIG9uQ29vcmRpbmF0ZUxvbmdQcmVzcyA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTG9uZ1ByZXNzXCIpO1xuXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG4gICAgdmFyIGxhdCA9IGV2ZW50LnBvc2l0aW9uLmxhdGl0dWRlO1xuICAgIHZhciBsbmcgPSBldmVudC5wb3NpdGlvbi5sb25naXR1ZGU7XG5cbiAgICBjb25zb2xlLmxvZyhcIlRhcHBlZCBsb2NhdGlvbjogXFxuXFx0TGF0aXR1ZGU6IFwiICsgZXZlbnQucG9zaXRpb24ubGF0aXR1ZGUgK1xuICAgICAgICAgICAgICAgICAgICBcIlxcblxcdExvbmdpdHVkZTogXCIgKyBldmVudC5wb3NpdGlvbi5sb25naXR1ZGUpO1xuXG4gICAgdmFyIG1hcmtlciA9IG5ldyBtYXBzTW9kdWxlLk1hcmtlcigpO1xuICAgIG1hcmtlci5wb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKGxhdCwgbG5nKTtcbiAgICBtYXJrZXIudGl0bGUgPSBcIk1hdHRpbGFubmllbWlcIjtcbiAgICBtYXJrZXIuc25pcHBldCA9IFwiVW5pdmVyc2l0eSBDYW1wdXNcIjtcbiAgICBtYXJrZXIudXNlckRhdGEgPSB7aW5kZXg6IDF9O1xuICAgIG1hcFZpZXcuYWRkTWFya2VyKG1hcmtlcik7XG4gIH07XG5cbiAgb25NYXJrZXJTZWxlY3QgPSAoZXZlbnQpID0+IHtcblxuICAgIGludGVyZmFjZSBQb3NpdGlvbk9iamVjdCB7XG4gICAgICBcImxhdGl0dWRlXCI6IHN0cmluZyxcbiAgICAgIFwibG9uZ2l0dWRlXCI6IHN0cmluZ1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyU2VsZWN0OiBcIiArIGV2ZW50Lm1hcmtlci50aXRsZVxuICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdFBvc2l0aW9uOiBcIiArIEpTT04uc3RyaW5naWZ5KGV2ZW50Lm1hcmtlci5wb3NpdGlvbikpO1xuXG4gICAgLy8gVE9ETzogVMOkbcOkIG9uIGpvc3RhaW4gc3l5c3TDpCB1bmRlZmluZWQuIFRoaXM6bGzDpCB2YXJtYWFuIHbDpMOkcsOkIHNjb3BlLlxuICAgIC8vbGV0IGN1cnJlbnRQb3MgPSBKU09OLnN0cmluZ2lmeSh0aGlzLl9jdXJyZW50UG9zaXRpb24pO1xuICAgIGxldCBjdXJyZW50UG9zID0gSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKTtcbiAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgcG9zaXRpb246IFwiICsgY3VycmVudFBvcyk7XG5cbiAgICBsZXQgbWFya2VyUG9zID0gSlNPTi5zdHJpbmdpZnkoZXZlbnQubWFya2VyLnBvc2l0aW9uKTtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlciBwb3NpdGlvbjogXCIgKyBtYXJrZXJQb3MpO1xuXG4gICAgbGV0IGRpc3RhbmNlID0gZ2VvbG9jYXRpb24uZGlzdGFuY2UoSlNPTi5wYXJzZShjdXJyZW50UG9zKSwgSlNPTi5wYXJzZShtYXJrZXJQb3MpKTtcblxuICAgIGNvbnNvbGUubG9nKFwiRGlzdGFuY2UgdG8gbWFya2VyOiBcIiArIGRpc3RhbmNlKTtcbiAgfTtcblxuICBvbk1hcmtlckJlZ2luRHJhZ2dpbmcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckJlZ2luRHJhZ2dpbmdcIik7XG4gIH07XG5cbiAgb25NYXJrZXJFbmREcmFnZ2luZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyRW5kRHJhZ2dpbmdcIik7XG4gIH07XG5cbiAgb25NYXJrZXJEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJEcmFnXCIpO1xuICB9O1xuXG4gIG9uQ2FtZXJhQ2hhbmdlZCA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiQ2FtZXJhQ2hhbmdlXCIpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRXYXRjaChldmVudCkge1xuXG4gIGludGVyZmFjZSBMb2NhdGlvbk9iamVjdCB7XG4gICAgXCJsYXRpdHVkZVwiOiBudW1iZXIsXG4gICAgXCJsb25naXR1ZGVcIjogbnVtYmVyLFxuICAgIFwiYWx0aXR1ZGVcIjogbnVtYmVyLFxuICAgIFwiaG9yaXpvbnRhbEFjY3VyYWN5XCI6IG51bWJlcixcbiAgICBcInZlcnRpY2FsQWNjdXJhY3lcIjogbnVtYmVyLFxuICAgIFwic3BlZWRcIjogbnVtYmVyLFxuICAgIFwiZGlyZWN0aW9uXCI6IG51bWJlcixcbiAgICBcInRpbWVzdGFtcFwiOnN0cmluZ1xuICB9XG5cbiAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG5cbiAgd2F0Y2hJZCA9IGdlb2xvY2F0aW9uLndhdGNoTG9jYXRpb24oXG4gIGZ1bmN0aW9uIChsb2MpIHtcbiAgICAgIGlmIChsb2MpIHtcbiAgICAgICAgICBsZXQgb2JqOiBMb2NhdGlvbk9iamVjdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobG9jKSk7XG4gICAgICAgICAgdGhpcy5sYXRpdHVkZSA9IG9iai5sYXRpdHVkZTtcbiAgICAgICAgICB0aGlzLmxvbmdpdHVkZSA9IG9iai5sb25naXR1ZGU7XG4gICAgICAgICAgdGhpcy5hbHRpdHVkZSA9IG9iai5hbHRpdHVkZTtcbiAgICAgICAgICAvKnZhciovY3VycmVudFBvc2l0aW9uID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcob2JqLmxhdGl0dWRlLCBvYmoubG9uZ2l0dWRlKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhuZXcgRGF0ZSgpICsgXCJcXG5SZWNlaXZlZCBsb2NhdGlvbjpcXG5cXHRMYXRpdHVkZTogXCIgKyBvYmoubGF0aXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRMb25naXR1ZGU6IFwiICsgb2JqLmxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdEFsdGl0dWRlOiBcIiArIG9iai5hbHRpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdFRpbWVzdGFtcDogXCIgKyBvYmoudGltZXN0YW1wXG4gICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0RGlyZWN0aW9uOiBcIiArIG9iai5kaXJlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXG5DdXJyZW50UG9zOiBcIiArIEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbikpO1xuXG4gICAgICAgICAgdmFyIGNpcmNsZSA9IG5ldyBtYXBzTW9kdWxlLkNpcmNsZSgpO1xuICAgICAgICAgIGNpcmNsZS5jZW50ZXIgPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyh0aGlzLmxhdGl0dWRlLCB0aGlzLmxvbmdpdHVkZSk7XG4gICAgICAgICAgY2lyY2xlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgIGNpcmNsZS5yYWRpdXMgPSAyMDtcbiAgICAgICAgICBjaXJjbGUuZmlsbENvbG9yID0gbmV3IENvbG9yKCcjNmM5ZGYwJyk7IC8vIzk5ZmY4ODAwXG4gICAgICAgICAgY2lyY2xlLnN0cm9rZUNvbG9yID0gbmV3IENvbG9yKCcjMzk2YWJkJyk7IC8vIzk5ZmYwMDAwXG4gICAgICAgICAgY2lyY2xlLnN0cm9rZVdpZHRoID0gMjtcbiAgICAgICAgICBtYXBWaWV3LmFkZENpcmNsZShjaXJjbGUpO1xuICAgICAgICAgIG1hcFZpZXcubGF0aXR1ZGUgPSB0aGlzLmxhdGl0dWRlO1xuICAgICAgICAgIG1hcFZpZXcubG9uZ2l0dWRlID0gdGhpcy5sb25naXR1ZGU7XG5cbiAgICAgIH1cbiAgfSxcbiAgZnVuY3Rpb24oZSl7XG4gICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIGUubWVzc2FnZSk7XG4gIH0sXG4gIHtkZXNpcmVkQWNjdXJhY3k6IDMsIHVwZGF0ZURpc3RhbmNlOiAxMCwgbWluaW11bVVwZGF0ZVRpbWUgOiAxMDAwICogMn0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kV2F0Y2goKSB7XG4gICAgaWYgKHdhdGNoSWQpIHtcbiAgICAgICAgZ2VvbG9jYXRpb24uY2xlYXJXYXRjaCh3YXRjaElkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJNeSB3YXRjaCBpcyBlbmRlZC4uLiBULiBKb24gU25vd1wiKTtcbiAgICB9XG59XG4iXX0=