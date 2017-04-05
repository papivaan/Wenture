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
                    circle.radius = 5;
                    circle.fillColor = new color_1.Color('#99ff8800');
                    circle.strokeColor = new color_1.Color('#99ff0000');
                    circle.strokeWidth = 2;
                    mapView.addCircle(circle);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBeUU7QUFDekUsMEVBQXNFO0FBQ3RFLHNEQUF3RDtBQUN4RCwrQkFBOEI7QUFFOUIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFFekQsa0NBQWUsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLE9BQU8sRUFBL0MsQ0FBK0MsQ0FBQyxDQUFDO0FBcUJsRixJQUFhLGdCQUFnQjtJQW5CN0I7UUFBQSxpQkE0SkM7UUE3SEMsZUFBVSxHQUFHLFVBQUMsS0FBSztZQVlqQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBRTNCLElBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQ3ZDLFVBQVUsR0FBRztnQkFDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNOLElBQUksR0FBRyxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDMUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO29CQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7b0JBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztvQkFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxHQUFHLG9DQUFvQyxHQUFHLEdBQUcsQ0FBQyxRQUFROzBCQUM1RCxpQkFBaUIsR0FBRyxHQUFHLENBQUMsU0FBUzswQkFDakMsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLFFBQVE7MEJBQy9CLGlCQUFpQixHQUFHLEdBQUcsQ0FB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QyxDQUFDO1FBQ0YsaUJBQVksR0FBRyxVQUFDLEtBQUs7WUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUM7UUFDRixvQkFBZSxHQUFHLFVBQUMsS0FBSztZQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFsSUMsbUNBQVEsR0FBUjtRQUNFLGVBQWU7UUFDZixvQkFBb0I7SUFDdEIsQ0FBQztJQStISCx1QkFBQztBQUFELENBQUMsQUF6SUQsSUF5SUM7QUF4SXVCO0lBQXJCLGdCQUFTLENBQUMsU0FBUyxDQUFDOzhCQUFVLGlCQUFVO2lEQUFDO0FBRC9CLGdCQUFnQjtJQW5CNUIsZ0JBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFdBQVcsRUFBRSw4QkFBOEI7UUFDM0MsU0FBUyxFQUFFLENBQUMsb0NBQW9DLEVBQUUsNkJBQTZCLENBQUM7S0FDakYsQ0FBQztHQWVXLGdCQUFnQixDQXlJNUI7QUF6SVksNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBPbkluaXQsIFZpZXdDaGlsZCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge3JlZ2lzdGVyRWxlbWVudH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL2VsZW1lbnQtcmVnaXN0cnlcIjtcbmltcG9ydCAqIGFzIGdlb2xvY2F0aW9uIGZyb20gXCJuYXRpdmVzY3JpcHQtZ2VvbG9jYXRpb25cIjtcbmltcG9ydCB7IENvbG9yIH0gZnJvbSBcImNvbG9yXCI7XG5cbnZhciBtYXBzTW9kdWxlID0gcmVxdWlyZShcIm5hdGl2ZXNjcmlwdC1nb29nbGUtbWFwcy1zZGtcIik7XG5cbnJlZ2lzdGVyRWxlbWVudChcIk1hcFZpZXdcIiwgKCkgPT4gcmVxdWlyZShcIm5hdGl2ZXNjcmlwdC1nb29nbGUtbWFwcy1zZGtcIikuTWFwVmlldyk7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogXCJtYXAtcGFnZVwiLFxuICB0ZW1wbGF0ZVVybDogXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS5odG1sXCIsXG4gIHN0eWxlVXJsczogW1wicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UtY29tbW9uLmNzc1wiLCBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmNzc1wiXVxufSlcblxuLypleHBvcnQgZnVuY3Rpb24gcHVibGljIHN0YXJ0V2F0Y2goKSB7XG4gICAgdmFyIHdhdGNoSWQgPSBnZW9sb2NhdGlvbi53YXRjaExvY2F0aW9uKFxuICAgIGZ1bmN0aW9uIChsb2MpIHtcbiAgICAgICAgaWYgKGxvYykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZWNlaXZlZCBsb2NhdGlvbjogXCIgKyBsb2MpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBmdW5jdGlvbihlKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBlLm1lc3NhZ2UpO1xuICAgIH0sXG4gICAge2Rlc2lyZWRBY2N1cmFjeTogMywgdXBkYXRlRGlzdGFuY2U6IDEwLCBtaW5pbXVtVXBkYXRlVGltZSA6IDEwMDAgKiAyMH0pOyAvLyBTaG91bGQgdXBkYXRlIGV2ZXJ5IDIwIHNlY29uZHMgYWNjb3JkaW5nIHRvIEdvb2dlIGRvY3VtZW50YXRpb24uIE5vdCB2ZXJpZmllZC5cbn0qL1xuXG5leHBvcnQgY2xhc3MgTWFwUGFnZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBWaWV3Q2hpbGQoXCJNYXBWaWV3XCIpIG1hcFZpZXc6IEVsZW1lbnRSZWY7XG5cbiAgbGF0aXR1ZGU6IG51bWJlcjtcbiAgbG9uZ2l0dWRlOiBudW1iZXI7XG4gIGFsdGl0dWRlOiBudW1iZXI7XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gVE9ETzogTG9hZGVyXG4gICAgLy90aGlzLnN0YXJ0V2F0Y2goKTtcbiAgfVxuXG4gIHN0YXJ0V2F0Y2ggPSAoZXZlbnQpID0+IHtcbiAgICBpbnRlcmZhY2UgTG9jYXRpb25PYmplY3Qge1xuICAgICAgXCJsYXRpdHVkZVwiOiBudW1iZXIsXG4gICAgICBcImxvbmdpdHVkZVwiOiBudW1iZXIsXG4gICAgICBcImFsdGl0dWRlXCI6IG51bWJlcixcbiAgICAgIFwiaG9yaXpvbnRhbEFjY3VyYWN5XCI6IG51bWJlcixcbiAgICAgIFwidmVydGljYWxBY2N1cmFjeVwiOiBudW1iZXIsXG4gICAgICBcInNwZWVkXCI6IG51bWJlcixcbiAgICAgIFwiZGlyZWN0aW9uXCI6IG51bWJlcixcbiAgICAgIFwidGltZXN0YW1wXCI6c3RyaW5nXG4gICAgfVxuXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG5cbiAgICB2YXIgd2F0Y2hJZCA9IGdlb2xvY2F0aW9uLndhdGNoTG9jYXRpb24oXG4gICAgZnVuY3Rpb24gKGxvYykge1xuICAgICAgICBpZiAobG9jKSB7XG4gICAgICAgICAgICBsZXQgb2JqOiBMb2NhdGlvbk9iamVjdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobG9jKSk7XG4gICAgICAgICAgICB0aGlzLmxhdGl0dWRlID0gb2JqLmxhdGl0dWRlO1xuICAgICAgICAgICAgdGhpcy5sb25naXR1ZGUgPSBvYmoubG9uZ2l0dWRlO1xuICAgICAgICAgICAgdGhpcy5hbHRpdHVkZSA9IG9iai5hbHRpdHVkZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ldyBEYXRlKCkgKyBcIlxcblJlY2VpdmVkIGxvY2F0aW9uOlxcblxcdExhdGl0dWRlOiBcIiArIG9iai5sYXRpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0TG9uZ2l0dWRlOiBcIiArIG9iai5sb25naXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdEFsdGl0dWRlOiBcIiArIG9iai5hbHRpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0VGltZXN0YW1wOiBcIiArIG9iai50aW1lc3RhbXApO1xuXG4gICAgICAgICAgICB2YXIgY2lyY2xlID0gbmV3IG1hcHNNb2R1bGUuQ2lyY2xlKCk7XG4gICAgICAgICAgICBjaXJjbGUuY2VudGVyID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcodGhpcy5sYXRpdHVkZSwgdGhpcy5sb25naXR1ZGUpO1xuICAgICAgICAgICAgY2lyY2xlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgY2lyY2xlLnJhZGl1cyA9IDU7XG4gICAgICAgICAgICBjaXJjbGUuZmlsbENvbG9yID0gbmV3IENvbG9yKCcjOTlmZjg4MDAnKTtcbiAgICAgICAgICAgIGNpcmNsZS5zdHJva2VDb2xvciA9IG5ldyBDb2xvcignIzk5ZmYwMDAwJyk7XG4gICAgICAgICAgICBjaXJjbGUuc3Ryb2tlV2lkdGggPSAyO1xuICAgICAgICAgICAgbWFwVmlldy5hZGRDaXJjbGUoY2lyY2xlKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZnVuY3Rpb24oZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgZS5tZXNzYWdlKTtcbiAgICB9LFxuICAgIHtkZXNpcmVkQWNjdXJhY3k6IDMsIHVwZGF0ZURpc3RhbmNlOiAxMCwgbWluaW11bVVwZGF0ZVRpbWUgOiAxMDAwICogMn0pO1xuXG5cbiAgfVxuXG4gIC8vTWFwIGV2ZW50c1xuICBvbk1hcFJlYWR5ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXAgUmVhZHlcIik7XG4gICAgdGhpcy5zdGFydFdhdGNoKGV2ZW50KTtcblxuICAgIC8vIENoZWNrIGlmIGxvY2F0aW9uIHNlcnZpY2VzIGFyZSBlbmFibGVkXG4gICAgaWYgKCFnZW9sb2NhdGlvbi5pc0VuYWJsZWQoKSkge1xuICAgICAgICBnZW9sb2NhdGlvbi5lbmFibGVMb2NhdGlvblJlcXVlc3QoKTtcbiAgICB9IGVsc2UgY29uc29sZS5sb2coXCJBbGxlcyBpbiBPcmRudW5nXCIpO1xuXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG4gICAgdmFyIGdNYXAgPSBtYXBWaWV3LmdNYXA7XG5cbiAgICB2YXIgbWFya2VyID0gbmV3IG1hcHNNb2R1bGUuTWFya2VyKCk7XG4gICAgbWFya2VyLnBvc2l0aW9uID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcoNjIuMjMwODkxMiwgMjUuNzM0Mzg1Myk7XG4gICAgbWFya2VyLnRpdGxlID0gXCJNYXR0aWxhbm5pZW1pXCI7XG4gICAgbWFya2VyLnNuaXBwZXQgPSBcIlVuaXZlcnNpdHkgQ2FtcHVzXCI7XG4gICAgbWFya2VyLnVzZXJEYXRhID0ge2luZGV4OiAxfTtcbiAgICBtYXBWaWV3LmFkZE1hcmtlcihtYXJrZXIpO1xuXG4gICAgdmFyIGNpcmNsZSA9IG5ldyBtYXBzTW9kdWxlLkNpcmNsZSgpO1xuICAgIGNpcmNsZS5jZW50ZXIgPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyg2Mi4yMywgMjUuNzMpO1xuICAgIGNpcmNsZS52aXNpYmxlID0gdHJ1ZTtcbiAgICBjaXJjbGUucmFkaXVzID0gNTA7XG4gICAgY2lyY2xlLmZpbGxDb2xvciA9IG5ldyBDb2xvcignIzk5ZmY4ODAwJyk7XG4gICAgY2lyY2xlLnN0cm9rZUNvbG9yID0gbmV3IENvbG9yKCcjOTlmZjAwMDAnKTtcbiAgICBjaXJjbGUuc3Ryb2tlV2lkdGggPSAyO1xuICAgIG1hcFZpZXcuYWRkQ2lyY2xlKGNpcmNsZSk7XG5cbi8qXG4gICAgdmFyIGxvY2F0aW9uID0gZ2VvbG9jYXRpb24uZ2V0Q3VycmVudExvY2F0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lyZWRBY2N1cmFjeTogMyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZURpc3RhbmNlOiAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW1BZ2U6IDIwMDAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMjAwMDBcbiAgICB9KS5cbiAgICB0aGVuKGZ1bmN0aW9uKGxvYykge1xuICAgICAgaWYgKGxvYykge1xuICAgICAgICBsZXQgb2JqOiBMb2NhdGlvbk9iamVjdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobG9jKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ3VycmVudCBsb2NhdGlvbjpcXG5MYXRpdHVkZTogXCIgKyBvYmoubGF0aXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuTG9uZ2l0dWRlOiBcIiArIG9iai5sb25naXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuQWx0aXR1ZGU6IFwiICsgb2JqLmFsdGl0dWRlKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbihlKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgZS5tZXNzYWdlKTtcbiAgICB9KTtcbiovXG5cbiAgfTtcbiAgb25Db29yZGluYXRlTG9uZ1ByZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJMb25nUHJlc3NcIik7XG5cbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgICB2YXIgbGF0ID0gZXZlbnQucG9zaXRpb24ubGF0aXR1ZGU7XG4gICAgdmFyIGxuZyA9IGV2ZW50LnBvc2l0aW9uLmxvbmdpdHVkZTtcblxuICAgIGNvbnNvbGUubG9nKFwiVGFwcGVkIGxvY2F0aW9uOiBcXG5cXHRMYXRpdHVkZTogXCIgKyBldmVudC5wb3NpdGlvbi5sYXRpdHVkZSArXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuXFx0TG9uZ2l0dWRlOiBcIiArIGV2ZW50LnBvc2l0aW9uLmxvbmdpdHVkZSk7XG5cbiAgICB2YXIgbWFya2VyID0gbmV3IG1hcHNNb2R1bGUuTWFya2VyKCk7XG4gICAgbWFya2VyLnBvc2l0aW9uID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcobGF0LCBsbmcpO1xuICAgIG1hcmtlci50aXRsZSA9IFwiTWF0dGlsYW5uaWVtaVwiO1xuICAgIG1hcmtlci5zbmlwcGV0ID0gXCJVbml2ZXJzaXR5IENhbXB1c1wiO1xuICAgIG1hcmtlci51c2VyRGF0YSA9IHtpbmRleDogMX07XG4gICAgbWFwVmlldy5hZGRNYXJrZXIobWFya2VyKTtcbiAgfTtcbiAgb25NYXJrZXJTZWxlY3QgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlclNlbGVjdDogXCIgKyBldmVudC5tYXJrZXIudGl0bGUpO1xuICB9O1xuICBvbk1hcmtlckJlZ2luRHJhZ2dpbmcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckJlZ2luRHJhZ2dpbmdcIik7XG4gIH07XG4gIG9uTWFya2VyRW5kRHJhZ2dpbmcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckVuZERyYWdnaW5nXCIpO1xuICB9O1xuICBvbk1hcmtlckRyYWcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckRyYWdcIik7XG4gIH07XG4gIG9uQ2FtZXJhQ2hhbmdlZCA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiQ2FtZXJhQ2hhbmdlXCIpO1xuICB9O1xufVxuIl19