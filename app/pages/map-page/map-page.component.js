"use strict";
var core_1 = require("@angular/core");
var element_registry_1 = require("nativescript-angular/element-registry");
var geolocation = require("nativescript-geolocation");
var color_1 = require("color");
var mapsModule = require("nativescript-google-maps-sdk");
element_registry_1.registerElement("MapView", function () { return require("nativescript-google-maps-sdk").MapView; });
var MapPageComponent = (function () {
    function MapPageComponent() {
        var _this = this;
        this.startWatch = function (event) {
            var mapView = event.object;
            var watchId = geolocation.watchLocation(function (loc) {
                if (loc) {
                    var obj = JSON.parse(JSON.stringify(loc));
                    this.latitude = obj.latitude;
                    this.longitude = obj.longitude;
                    this.altitude = obj.altitude;
                    console.log(new Date() + "\nReceived location:\n\tLatitude: " + obj.latitude
                        + "\n\tLongitude: " + obj.longitude
                        + "\n\tAltitude: " + obj.altitude
                        + "\n\tTimestamp: " + obj.timestamp);
                    var circle = new mapsModule.Circle();
                    circle.center = mapsModule.Position.positionFromLatLng(this.latitude, this.longitude);
                    circle.visible = true;
                    circle.radius = 20;
                    circle.fillColor = new color_1.Color('#99ff8800');
                    circle.strokeColor = new color_1.Color('#99ff0000');
                    circle.strokeWidth = 2;
                    mapView.addCircle(circle);
                    mapView.latitude = this.latitude;
                    mapView.longitude = this.longitude;
                }
            }, function (e) {
                console.log("Error: " + e.message);
            }, { desiredAccuracy: 3, updateDistance: 10, minimumUpdateTime: 1000 * 2 });
        };
        //Map events
        this.onMapReady = function (event) {
            console.log("Map Ready");
            _this.startWatch(event);
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
            var circle = new mapsModule.Circle();
            circle.center = mapsModule.Position.positionFromLatLng(62.23, 25.73);
            circle.visible = true;
            circle.radius = 50;
            circle.fillColor = new color_1.Color('#99ff8800');
            circle.strokeColor = new color_1.Color('#99ff0000');
            circle.strokeWidth = 2;
            mapView.addCircle(circle);
            /*
                var location = geolocation.getCurrentLocation({
                                          desiredAccuracy: 3,
                                          updateDistance: 10,
                                          maximumAge: 20000,
                                          timeout: 20000
                }).
                then(function(loc) {
                  if (loc) {
                    let obj: LocationObject = JSON.parse(JSON.stringify(loc));
                    console.log("Current location:\nLatitude: " + obj.latitude
                                  + "\nLongitude: " + obj.longitude
                                  + "\nAltitude: " + obj.altitude);
                  }
                }, function(e){
                  console.log("Error: " + e.message);
                });
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
            console.log("MarkerSelect: " + event.marker.title);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBeUU7QUFDekUsMEVBQXNFO0FBQ3RFLHNEQUF3RDtBQUN4RCwrQkFBOEI7QUFFOUIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFFekQsa0NBQWUsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLE9BQU8sRUFBL0MsQ0FBK0MsQ0FBQyxDQUFDO0FBcUJsRixJQUFhLGdCQUFnQjtJQW5CN0I7UUFBQSxpQkErSkM7UUFoSUMsZUFBVSxHQUFHLFVBQUMsS0FBSztZQVlqQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBRTNCLElBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQ3ZDLFVBQVUsR0FBRztnQkFDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNOLElBQUksR0FBRyxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDMUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO29CQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7b0JBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztvQkFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxHQUFHLG9DQUFvQyxHQUFHLEdBQUcsQ0FBQyxRQUFROzBCQUM1RCxpQkFBaUIsR0FBRyxHQUFHLENBQUMsU0FBUzswQkFDakMsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLFFBQVE7MEJBQy9CLGlCQUFpQixHQUFHLEdBQUcsQ0FB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QUNyQyxDQUFDLENBQUM7UUFDRix3QkFBbUIsR0FBRyxVQUFDLEtBQUs7WUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQztRQUNGLGlCQUFZLEdBQUcsVUFBQyxLQUFLO1lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDO1FBQ0Ysb0JBQWUsR0FBRyxVQUFDLEtBQUs7WUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUM7SUFDSixDQUFDO0lBcklDLG1DQUFRLEdBQVI7UUFDRSxlQUFlO1FBQ2Ysb0JBQW9CO0lBQ3RCLENBQUM7SUFrSUgsdUJBQUM7QUFBRCxDQUFDLEFBNUlELElBNElDO0FBM0l1QjtJQUFyQixnQkFBUyxDQUFDLFNBQVMsQ0FBQzs4QkFBVSxpQkFBVTtpREFBQztBQUQvQixnQkFBZ0I7SUFuQjVCLGdCQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsVUFBVTtRQUNwQixXQUFXLEVBQUUsOEJBQThCO1FBQzNDLFNBQVMsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLDZCQUE2QixDQUFDO0tBQ2pGLENBQUM7R0FlVyxnQkFBZ0IsQ0E0STVCO0FBNUlZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQge3JlZ2lzdGVyRWxlbWVudH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL2VsZW1lbnQtcmVnaXN0cnlcIjtcclxuaW1wb3J0ICogYXMgZ2VvbG9jYXRpb24gZnJvbSBcIm5hdGl2ZXNjcmlwdC1nZW9sb2NhdGlvblwiO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCJjb2xvclwiO1xyXG5cclxudmFyIG1hcHNNb2R1bGUgPSByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKTtcclxuXHJcbnJlZ2lzdGVyRWxlbWVudChcIk1hcFZpZXdcIiwgKCkgPT4gcmVxdWlyZShcIm5hdGl2ZXNjcmlwdC1nb29nbGUtbWFwcy1zZGtcIikuTWFwVmlldyk7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogXCJtYXAtcGFnZVwiLFxyXG4gIHRlbXBsYXRlVXJsOiBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmh0bWxcIixcclxuICBzdHlsZVVybHM6IFtcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLWNvbW1vbi5jc3NcIiwgXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS5jc3NcIl1cclxufSlcclxuXHJcbi8qZXhwb3J0IGZ1bmN0aW9uIHB1YmxpYyBzdGFydFdhdGNoKCkge1xyXG4gICAgdmFyIHdhdGNoSWQgPSBnZW9sb2NhdGlvbi53YXRjaExvY2F0aW9uKFxyXG4gICAgZnVuY3Rpb24gKGxvYykge1xyXG4gICAgICAgIGlmIChsb2MpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZWNlaXZlZCBsb2NhdGlvbjogXCIgKyBsb2MpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBmdW5jdGlvbihlKXtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIGUubWVzc2FnZSk7XHJcbiAgICB9LFxyXG4gICAge2Rlc2lyZWRBY2N1cmFjeTogMywgdXBkYXRlRGlzdGFuY2U6IDEwLCBtaW5pbXVtVXBkYXRlVGltZSA6IDEwMDAgKiAyMH0pOyAvLyBTaG91bGQgdXBkYXRlIGV2ZXJ5IDIwIHNlY29uZHMgYWNjb3JkaW5nIHRvIEdvb2dlIGRvY3VtZW50YXRpb24uIE5vdCB2ZXJpZmllZC5cclxufSovXHJcblxyXG5leHBvcnQgY2xhc3MgTWFwUGFnZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XHJcbiAgQFZpZXdDaGlsZChcIk1hcFZpZXdcIikgbWFwVmlldzogRWxlbWVudFJlZjtcclxuXHJcbiAgbGF0aXR1ZGU6IG51bWJlcjtcclxuICBsb25naXR1ZGU6IG51bWJlcjtcclxuICBhbHRpdHVkZTogbnVtYmVyO1xyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuICAgIC8vIFRPRE86IExvYWRlclxyXG4gICAgLy90aGlzLnN0YXJ0V2F0Y2goKTtcclxuICB9XHJcblxyXG4gIHN0YXJ0V2F0Y2ggPSAoZXZlbnQpID0+IHtcclxuICAgIGludGVyZmFjZSBMb2NhdGlvbk9iamVjdCB7XHJcbiAgICAgIFwibGF0aXR1ZGVcIjogbnVtYmVyLFxyXG4gICAgICBcImxvbmdpdHVkZVwiOiBudW1iZXIsXHJcbiAgICAgIFwiYWx0aXR1ZGVcIjogbnVtYmVyLFxyXG4gICAgICBcImhvcml6b250YWxBY2N1cmFjeVwiOiBudW1iZXIsXHJcbiAgICAgIFwidmVydGljYWxBY2N1cmFjeVwiOiBudW1iZXIsXHJcbiAgICAgIFwic3BlZWRcIjogbnVtYmVyLFxyXG4gICAgICBcImRpcmVjdGlvblwiOiBudW1iZXIsXHJcbiAgICAgIFwidGltZXN0YW1wXCI6c3RyaW5nXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XHJcblxyXG4gICAgdmFyIHdhdGNoSWQgPSBnZW9sb2NhdGlvbi53YXRjaExvY2F0aW9uKFxyXG4gICAgZnVuY3Rpb24gKGxvYykge1xyXG4gICAgICAgIGlmIChsb2MpIHtcclxuICAgICAgICAgICAgbGV0IG9iajogTG9jYXRpb25PYmplY3QgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGxvYykpO1xyXG4gICAgICAgICAgICB0aGlzLmxhdGl0dWRlID0gb2JqLmxhdGl0dWRlO1xyXG4gICAgICAgICAgICB0aGlzLmxvbmdpdHVkZSA9IG9iai5sb25naXR1ZGU7XHJcbiAgICAgICAgICAgIHRoaXMuYWx0aXR1ZGUgPSBvYmouYWx0aXR1ZGU7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ldyBEYXRlKCkgKyBcIlxcblJlY2VpdmVkIGxvY2F0aW9uOlxcblxcdExhdGl0dWRlOiBcIiArIG9iai5sYXRpdHVkZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRMb25naXR1ZGU6IFwiICsgb2JqLmxvbmdpdHVkZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRBbHRpdHVkZTogXCIgKyBvYmouYWx0aXR1ZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0VGltZXN0YW1wOiBcIiArIG9iai50aW1lc3RhbXApO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNpcmNsZSA9IG5ldyBtYXBzTW9kdWxlLkNpcmNsZSgpO1xyXG4gICAgICAgICAgICBjaXJjbGUuY2VudGVyID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcodGhpcy5sYXRpdHVkZSwgdGhpcy5sb25naXR1ZGUpO1xyXG4gICAgICAgICAgICBjaXJjbGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGNpcmNsZS5yYWRpdXMgPSAyMDtcclxuICAgICAgICAgICAgY2lyY2xlLmZpbGxDb2xvciA9IG5ldyBDb2xvcignIzk5ZmY4ODAwJyk7XHJcbiAgICAgICAgICAgIGNpcmNsZS5zdHJva2VDb2xvciA9IG5ldyBDb2xvcignIzk5ZmYwMDAwJyk7XHJcbiAgICAgICAgICAgIGNpcmNsZS5zdHJva2VXaWR0aCA9IDI7XHJcbiAgICAgICAgICAgIG1hcFZpZXcuYWRkQ2lyY2xlKGNpcmNsZSk7XHJcbiAgICAgICAgICAgIG1hcFZpZXcubGF0aXR1ZGUgPSB0aGlzLmxhdGl0dWRlO1xyXG4gICAgICAgICAgICBtYXBWaWV3LmxvbmdpdHVkZSA9IHRoaXMubG9uZ2l0dWRlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBmdW5jdGlvbihlKXtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIGUubWVzc2FnZSk7XHJcbiAgICB9LFxyXG4gICAge2Rlc2lyZWRBY2N1cmFjeTogMywgdXBkYXRlRGlzdGFuY2U6IDEwLCBtaW5pbXVtVXBkYXRlVGltZSA6IDEwMDAgKiAyfSk7XHJcblxyXG5cclxuICB9XHJcblxyXG4gIC8vTWFwIGV2ZW50c1xyXG4gIG9uTWFwUmVhZHkgPSAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwiTWFwIFJlYWR5XCIpO1xyXG4gICAgdGhpcy5zdGFydFdhdGNoKGV2ZW50KTtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBsb2NhdGlvbiBzZXJ2aWNlcyBhcmUgZW5hYmxlZFxyXG4gICAgaWYgKCFnZW9sb2NhdGlvbi5pc0VuYWJsZWQoKSkge1xyXG4gICAgICAgIGdlb2xvY2F0aW9uLmVuYWJsZUxvY2F0aW9uUmVxdWVzdCgpO1xyXG4gICAgfSBlbHNlIGNvbnNvbGUubG9nKFwiQWxsZXMgaW4gT3JkbnVuZ1wiKTtcclxuXHJcbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcclxuICAgIHZhciBnTWFwID0gbWFwVmlldy5nTWFwO1xyXG5cclxuICAgIHZhciBtYXJrZXIgPSBuZXcgbWFwc01vZHVsZS5NYXJrZXIoKTtcclxuICAgIG1hcmtlci5wb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKDYyLjIzMDg5MTIsIDI1LjczNDM4NTMpO1xyXG4gICAgbWFya2VyLnRpdGxlID0gXCJNYXR0aWxhbm5pZW1pXCI7XHJcbiAgICBtYXJrZXIuc25pcHBldCA9IFwiVW5pdmVyc2l0eSBDYW1wdXNcIjtcclxuICAgIG1hcmtlci51c2VyRGF0YSA9IHtpbmRleDogMX07XHJcbiAgICBtYXBWaWV3LmFkZE1hcmtlcihtYXJrZXIpO1xyXG5cclxuICAgIHZhciBjaXJjbGUgPSBuZXcgbWFwc01vZHVsZS5DaXJjbGUoKTtcclxuICAgIGNpcmNsZS5jZW50ZXIgPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyg2Mi4yMywgMjUuNzMpO1xyXG4gICAgY2lyY2xlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgY2lyY2xlLnJhZGl1cyA9IDUwO1xyXG4gICAgY2lyY2xlLmZpbGxDb2xvciA9IG5ldyBDb2xvcignIzk5ZmY4ODAwJyk7XHJcbiAgICBjaXJjbGUuc3Ryb2tlQ29sb3IgPSBuZXcgQ29sb3IoJyM5OWZmMDAwMCcpO1xyXG4gICAgY2lyY2xlLnN0cm9rZVdpZHRoID0gMjtcclxuICAgIG1hcFZpZXcuYWRkQ2lyY2xlKGNpcmNsZSk7XHJcblxyXG5cclxuLypcclxuICAgIHZhciBsb2NhdGlvbiA9IGdlb2xvY2F0aW9uLmdldEN1cnJlbnRMb2NhdGlvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lyZWRBY2N1cmFjeTogMyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlRGlzdGFuY2U6IDEwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtQWdlOiAyMDAwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMjAwMDBcclxuICAgIH0pLlxyXG4gICAgdGhlbihmdW5jdGlvbihsb2MpIHtcclxuICAgICAgaWYgKGxvYykge1xyXG4gICAgICAgIGxldCBvYmo6IExvY2F0aW9uT2JqZWN0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShsb2MpKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgbG9jYXRpb246XFxuTGF0aXR1ZGU6IFwiICsgb2JqLmxhdGl0dWRlXHJcbiAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuTG9uZ2l0dWRlOiBcIiArIG9iai5sb25naXR1ZGVcclxuICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5BbHRpdHVkZTogXCIgKyBvYmouYWx0aXR1ZGUpO1xyXG4gICAgICB9XHJcbiAgICB9LCBmdW5jdGlvbihlKXtcclxuICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBlLm1lc3NhZ2UpO1xyXG4gICAgfSk7XHJcbiovXHJcblxyXG4gIH07XHJcbiAgb25Db29yZGluYXRlTG9uZ1ByZXNzID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIkxvbmdQcmVzc1wiKTtcclxuXHJcbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcclxuICAgIHZhciBsYXQgPSBldmVudC5wb3NpdGlvbi5sYXRpdHVkZTtcclxuICAgIHZhciBsbmcgPSBldmVudC5wb3NpdGlvbi5sb25naXR1ZGU7XHJcblxyXG4gICAgY29uc29sZS5sb2coXCJUYXBwZWQgbG9jYXRpb246IFxcblxcdExhdGl0dWRlOiBcIiArIGV2ZW50LnBvc2l0aW9uLmxhdGl0dWRlICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcblxcdExvbmdpdHVkZTogXCIgKyBldmVudC5wb3NpdGlvbi5sb25naXR1ZGUpO1xyXG5cclxuICAgIHZhciBtYXJrZXIgPSBuZXcgbWFwc01vZHVsZS5NYXJrZXIoKTtcclxuICAgIG1hcmtlci5wb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKGxhdCwgbG5nKTtcclxuICAgIG1hcmtlci50aXRsZSA9IFwiTWF0dGlsYW5uaWVtaVwiO1xyXG4gICAgbWFya2VyLnNuaXBwZXQgPSBcIlVuaXZlcnNpdHkgQ2FtcHVzXCI7XHJcbiAgICBtYXJrZXIudXNlckRhdGEgPSB7aW5kZXg6IDF9O1xyXG4gICAgbWFwVmlldy5hZGRNYXJrZXIobWFya2VyKTtcclxuICB9O1xyXG4gIG9uTWFya2VyU2VsZWN0ID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlclNlbGVjdDogXCIgKyBldmVudC5tYXJrZXIudGl0bGUpO1xyXG4gIH07XHJcbiAgb25NYXJrZXJCZWdpbkRyYWdnaW5nID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckJlZ2luRHJhZ2dpbmdcIik7XHJcbiAgfTtcclxuICBvbk1hcmtlckVuZERyYWdnaW5nID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckVuZERyYWdnaW5nXCIpO1xyXG4gIH07XHJcbiAgb25NYXJrZXJEcmFnID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckRyYWdcIik7XHJcbiAgfTtcclxuICBvbkNhbWVyYUNoYW5nZWQgPSAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwiQ2FtZXJhQ2hhbmdlXCIpO1xyXG4gIH07XHJcbn1cclxuIl19