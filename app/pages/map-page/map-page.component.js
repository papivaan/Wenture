"use strict";
var core_1 = require("@angular/core");
var element_registry_1 = require("nativescript-angular/element-registry");
var geolocation = require("nativescript-geolocation");
var mapsModule = require("nativescript-google-maps-sdk");
element_registry_1.registerElement("MapView", function () { return require("nativescript-google-maps-sdk").MapView; });
var MapPageComponent = (function () {
    function MapPageComponent() {
        //Map events
        this.onMapReady = function (event) {
            console.log("Map Ready");
            // TODO: Set marker etc.
            // Check if location services are enabled
            if (!geolocation.isEnabled()) {
                geolocation.enableLocationRequest();
            }
            else
                console.log("Alles in Ordnung");
            var mapView = event.object;
            var marker = new mapsModule.Marker();
            marker.position = mapsModule.Position.positionFromLatLng(62.2308912, 25.7343853);
            marker.title = "Sydney";
            marker.snippet = "Australia";
            marker.userData = { index: 1 };
            mapView.addMarker(marker);
            var location = geolocation.getCurrentLocation({ desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000 }).
                then(function (loc) {
                if (loc) {
                    console.log("Current location is: " + loc);
                }
            }, function (e) {
                console.log("Error: " + e.message);
            });
        };
        this.onMarkerSelect = function (event) {
            console.log("MarkerSelect");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBeUU7QUFDekUsMEVBQXNFO0FBQ3RFLHNEQUF5RDtBQUN6RCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUV6RCxrQ0FBZSxDQUFDLFNBQVMsRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsT0FBTyxFQUEvQyxDQUErQyxDQUFDLENBQUM7QUFRbEYsSUFBYSxnQkFBZ0I7SUFON0I7UUFhRSxZQUFZO1FBQ1osZUFBVSxHQUFHLFVBQUMsS0FBSztZQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3pCLHdCQUF3QjtZQUV4Qix5Q0FBeUM7WUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixXQUFXLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUN4QyxDQUFDO1lBQUMsSUFBSTtnQkFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFdkMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUUzQixJQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2pGLE1BQU0sQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsRUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFDLENBQUM7WUFDN0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUxQixJQUFJLFFBQVEsR0FBRyxXQUFXLENBQUMsa0JBQWtCLENBQUMsRUFBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFDLENBQUM7Z0JBQzFILElBQUksQ0FBQyxVQUFTLEdBQUc7Z0JBQ2YsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDUixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QyxDQUFDO1lBQ0gsQ0FBQyxFQUFFLFVBQVMsQ0FBQztnQkFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFDRixtQkFBYyxHQUFHLFVBQUMsS0FBSztZQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQztRQUNGLDBCQUFxQixHQUFHLFVBQUMsS0FBSztZQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDO1FBQ0Ysd0JBQW1CLEdBQUcsVUFBQyxLQUFLO1lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUM7UUFDRixpQkFBWSxHQUFHLFVBQUMsS0FBSztZQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQztRQUNGLG9CQUFlLEdBQUcsVUFBQyxLQUFLO1lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQS9DQyxtQ0FBUSxHQUFSO1FBQ0UsZUFBZTtJQUNqQixDQUFDO0lBNkNILHVCQUFDO0FBQUQsQ0FBQyxBQWxERCxJQWtEQztBQWpEdUI7SUFBckIsZ0JBQVMsQ0FBQyxTQUFTLENBQUM7OEJBQVUsaUJBQVU7aURBQUM7QUFEL0IsZ0JBQWdCO0lBTjVCLGdCQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsVUFBVTtRQUNwQixXQUFXLEVBQUUsOEJBQThCO1FBQzNDLFNBQVMsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLDZCQUE2QixDQUFDO0tBQ2pGLENBQUM7R0FFVyxnQkFBZ0IsQ0FrRDVCO0FBbERZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtyZWdpc3RlckVsZW1lbnR9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9lbGVtZW50LXJlZ2lzdHJ5XCI7XG5pbXBvcnQgZ2VvbG9jYXRpb24gPSByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdlb2xvY2F0aW9uXCIpO1xudmFyIG1hcHNNb2R1bGUgPSByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKTtcblxucmVnaXN0ZXJFbGVtZW50KFwiTWFwVmlld1wiLCAoKSA9PiByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKS5NYXBWaWV3KTtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm1hcC1wYWdlXCIsXG4gIHRlbXBsYXRlVXJsOiBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmh0bWxcIixcbiAgc3R5bGVVcmxzOiBbXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS1jb21tb24uY3NzXCIsIFwicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UuY3NzXCJdXG59KVxuXG5leHBvcnQgY2xhc3MgTWFwUGFnZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBWaWV3Q2hpbGQoXCJNYXBWaWV3XCIpIG1hcFZpZXc6IEVsZW1lbnRSZWY7XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gVE9ETzogTG9hZGVyXG4gIH1cblxuICAvL01hcCBldmVudHNcbiAgb25NYXBSZWFkeSA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTWFwIFJlYWR5XCIpO1xuICAgIC8vIFRPRE86IFNldCBtYXJrZXIgZXRjLlxuXG4gICAgLy8gQ2hlY2sgaWYgbG9jYXRpb24gc2VydmljZXMgYXJlIGVuYWJsZWRcbiAgICBpZiAoIWdlb2xvY2F0aW9uLmlzRW5hYmxlZCgpKSB7XG4gICAgICAgIGdlb2xvY2F0aW9uLmVuYWJsZUxvY2F0aW9uUmVxdWVzdCgpO1xuICAgIH0gZWxzZSBjb25zb2xlLmxvZyhcIkFsbGVzIGluIE9yZG51bmdcIik7XG5cbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcblxuICAgIHZhciBtYXJrZXIgPSBuZXcgbWFwc01vZHVsZS5NYXJrZXIoKTtcbiAgICBtYXJrZXIucG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyg2Mi4yMzA4OTEyLCAyNS43MzQzODUzKTtcbiAgICBtYXJrZXIudGl0bGUgPSBcIlN5ZG5leVwiO1xuICAgIG1hcmtlci5zbmlwcGV0ID0gXCJBdXN0cmFsaWFcIjtcbiAgICBtYXJrZXIudXNlckRhdGEgPSB7aW5kZXg6IDF9O1xuICAgIG1hcFZpZXcuYWRkTWFya2VyKG1hcmtlcik7XG5cbiAgICB2YXIgbG9jYXRpb24gPSBnZW9sb2NhdGlvbi5nZXRDdXJyZW50TG9jYXRpb24oe2Rlc2lyZWRBY2N1cmFjeTogMywgdXBkYXRlRGlzdGFuY2U6IDEwLCBtYXhpbXVtQWdlOiAyMDAwMCwgdGltZW91dDogMjAwMDB9KS5cbiAgICB0aGVuKGZ1bmN0aW9uKGxvYykge1xuICAgICAgaWYgKGxvYykge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgbG9jYXRpb24gaXM6IFwiICsgbG9jKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbihlKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgZS5tZXNzYWdlKTtcbiAgICB9KTtcbiAgfTtcbiAgb25NYXJrZXJTZWxlY3QgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlclNlbGVjdFwiKTtcbiAgfTtcbiAgb25NYXJrZXJCZWdpbkRyYWdnaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJCZWdpbkRyYWdnaW5nXCIpO1xuICB9O1xuICBvbk1hcmtlckVuZERyYWdnaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJFbmREcmFnZ2luZ1wiKTtcbiAgfTtcbiAgb25NYXJrZXJEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJEcmFnXCIpO1xuICB9O1xuICBvbkNhbWVyYUNoYW5nZWQgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIkNhbWVyYUNoYW5nZVwiKTtcbiAgfTtcbn1cbiJdfQ==