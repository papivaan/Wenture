"use strict";
var core_1 = require("@angular/core");
var platform_1 = require("platform");
var element_registry_1 = require("nativescript-angular/element-registry");
var geolocation = require("nativescript-geolocation");
var color_1 = require("color");
var mapsModule = require("nativescript-google-maps-sdk");
var dialogsModule = require("ui/dialogs");
var watchId;
var currentPosition;
var collectDistance; //distance in m on how close to enable collect-property
var mapView;
var collectedMarkers = [];
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
            marker.title = "Wenture point";
            marker.snippet = "";
            marker.draggable = true;
            marker.userData = { index: 1 };
            mapView.addMarker(marker);
        };
        this.onMarkerSelect = function (event) {
            var mapView = event.object;
            var markerPos = JSON.stringify(event.marker.position);
            var currentPos = JSON.stringify(currentPosition);
            var distance = getDistanceTo(event.marker);
            event.marker.snippet = "Distance: " + distance.toFixed(0) + " m";
            console.log("\n\tMarkerSelect: " + event.marker.title
                + "\n\tMarker position: " + markerPos
                + "\n\tCurrent position: " + currentPos
                + "\n\tDistance to marker: " + distance.toFixed(2) + "m");
            // This might be stupid, but works for now :)
            //TODO: adding collected marker to a list etc. b4 removing
            function collectMarker(mark) {
                collectDistance = 50;
                if (getDistanceTo(mark) < collectDistance) {
                    var amount = howManyCollected();
                    collect(amount);
                    //alert("Venture point collected. \nCollected: " + amount);
                    collectedMarkers.push(mark);
                    mapView.removeMarker(mark);
                    console.log("You have " + collectedMarkers.length + " collected markers.");
                }
                else {
                    console.log("\nMarker too far away, move closer.");
                }
            }
            collectMarker(event.marker);
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
        this.onShapeSelect = function (event) {
            console.log("Your current position is: " + JSON.stringify(currentPosition));
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
            circle.clickable = true;
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
// TODO: toimimaan androidille kanssa
function getDistanceTo(obj) {
    var objPos = JSON.stringify(obj.position);
    var currentPos = JSON.stringify(currentPosition);
    var distance = null;
    if (platform_1.isIOS) {
        //console.log("Running on ios.")
        distance = geolocation.distance(JSON.parse(objPos)._ios, JSON.parse(currentPos)._ios);
    }
    else if (platform_1.isAndroid) {
        console.log("Running on android.");
        distance = geolocation.distance(JSON.parse(objPos)._android, JSON.parse(currentPos)._android);
    }
    else {
        distance = "error";
        console.log("Could not find distance.");
    }
    return distance;
}
function howManyCollected() {
    return collectedMarkers.length + 1;
}
//handles the collection and returns message
function collect(amount) {
    dialogsModule.alert({
        message: "Wenture point collected! \nYou have: " + amount,
        okButtonText: "OK"
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBeUU7QUFDekUscUNBQTRDO0FBQzVDLDBFQUFzRTtBQUN0RSxzREFBd0Q7QUFDeEQsK0JBQThCO0FBRTlCLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ3pELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUUxQyxJQUFJLE9BQVksQ0FBQztBQUNqQixJQUFJLGVBQXlCLENBQUM7QUFDOUIsSUFBSSxlQUF1QixDQUFDLENBQUMsdURBQXVEO0FBQ3BGLElBQUksT0FBWSxDQUFDO0FBQ2pCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzFCLDRCQUE0QjtBQUU1QixrQ0FBZSxDQUFDLFNBQVMsRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsT0FBTyxFQUEvQyxDQUErQyxDQUFDLENBQUM7QUFxQmxGLElBQWEsZ0JBQWdCO0lBbkI3QjtRQWdDRSxZQUFZO1FBQ1osZUFBVSxHQUFHLFVBQUMsS0FBSztZQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3pCLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVsQix5Q0FBeUM7WUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixXQUFXLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUN4QyxDQUFDO1lBQUMsSUFBSTtnQkFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFdkMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUMzQixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBRXhCLElBQUksTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDakYsTUFBTSxDQUFDLEtBQUssR0FBRyxlQUFlLENBQUM7WUFDL0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQztZQUNyQyxNQUFNLENBQUMsUUFBUSxHQUFHLEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBQyxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUI7Ozs7Ozs7OztjQVNFO1FBQ0EsQ0FBQyxDQUFDO1FBRUYsMEJBQXFCLEdBQUcsVUFBQyxLQUFLO1lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFekIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUMzQixJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztZQUNsQyxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztZQUVuQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUTtnQkFDdkQsaUJBQWlCLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUU5RCxJQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ25FLE1BQU0sQ0FBQyxLQUFLLEdBQUcsZUFBZSxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsRUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFDLENBQUM7WUFDN0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUM7UUFFRixtQkFBYyxHQUFHLFVBQUMsS0FBSztZQU9yQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBRTNCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0RCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ2pELElBQUksUUFBUSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFM0MsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBRWpFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLO2tCQUNyQyx1QkFBdUIsR0FBRyxTQUFTO2tCQUNuQyx3QkFBd0IsR0FBRyxVQUFVO2tCQUNyQywwQkFBMEIsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBRXhFLDZDQUE2QztZQUM3QywwREFBMEQ7WUFDMUQsdUJBQXVCLElBQUk7Z0JBQ3pCLGVBQWUsR0FBRyxFQUFFLENBQUM7Z0JBQ3JCLEVBQUUsQ0FBQSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxJQUFJLE1BQU0sR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO29CQUNoQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2hCLDJEQUEyRDtvQkFDM0QsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM1QixPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcscUJBQXFCLENBQUMsQ0FBQTtnQkFDNUUsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7Z0JBQ3JELENBQUM7WUFDSCxDQUFDO1lBRUQsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU5QixDQUFDLENBQUM7UUFFRiwwQkFBcUIsR0FBRyxVQUFDLEtBQUs7WUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQztRQUVGLHdCQUFtQixHQUFHLFVBQUMsS0FBSztZQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDO1FBRUYsaUJBQVksR0FBRyxVQUFDLEtBQUs7WUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUM7UUFFRixvQkFBZSxHQUFHLFVBQUMsS0FBSztZQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQztRQUVGLGtCQUFhLEdBQUcsVUFBQyxLQUFLO1lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzlFLENBQUMsQ0FBQztJQUNKLENBQUM7SUFsSEMsbUNBQVEsR0FBUjtRQUNFLGVBQWU7UUFDZixvQkFBb0I7SUFDdEIsQ0FBQztJQStHSCx1QkFBQztBQUFELENBQUMsQUExSEQsSUEwSEM7QUF6SHVCO0lBQXJCLGdCQUFTLENBQUMsU0FBUyxDQUFDOzhCQUFVLGlCQUFVO2lEQUFDO0FBRC9CLGdCQUFnQjtJQW5CNUIsZ0JBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFdBQVcsRUFBRSw4QkFBOEI7UUFDM0MsU0FBUyxFQUFFLENBQUMsb0NBQW9DLEVBQUUsNkJBQTZCLENBQUM7S0FDakYsQ0FBQztHQWVXLGdCQUFnQixDQTBINUI7QUExSFksNENBQWdCO0FBNEg3QixvQkFBMkIsS0FBSztJQWE5QixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBRTNCLE9BQU8sR0FBRyxXQUFXLENBQUMsYUFBYSxDQUNuQyxVQUFVLEdBQUc7UUFDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ04sSUFBSSxHQUFHLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUM7WUFDL0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1lBQzdCLE9BQU8sQ0FBQSxlQUFlLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3RixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLEdBQUcsb0NBQW9DLEdBQUcsR0FBRyxDQUFDLFFBQVE7a0JBQzVELGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxTQUFTO2tCQUNqQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUMsUUFBUTtrQkFDL0IsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLFNBQVM7a0JBQ2pDLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxTQUFTO2tCQUNqQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFFdEUsSUFBSSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDckMsTUFBTSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxhQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXO1lBQ3BELE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxhQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXO1lBQ3RELE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2pDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUV2QyxDQUFDO0lBQ0wsQ0FBQyxFQUNELFVBQVMsQ0FBQztRQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2QyxDQUFDLEVBQ0QsRUFBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsaUJBQWlCLEVBQUcsSUFBSSxHQUFHLENBQUMsRUFBQyxDQUFDLENBQUM7QUFDMUUsQ0FBQztBQWhERCxnQ0FnREM7QUFFRDtJQUNJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDVixXQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztJQUNwRCxDQUFDO0FBQ0wsQ0FBQztBQUxELDRCQUtDO0FBRUQscUNBQXFDO0FBQ3JDLHVCQUF1QixHQUFHO0lBQ3hCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDakQsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBRXBCLEVBQUUsQ0FBQSxDQUFDLGdCQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ1QsZ0NBQWdDO1FBQ2hDLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEYsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUEsQ0FBQyxvQkFBUyxDQUFDLENBQUMsQ0FBQztRQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDbkMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ0MsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNwQixDQUFDO0FBRUQ7SUFDRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQsNENBQTRDO0FBQzVDLGlCQUFpQixNQUFNO0lBQ3JCLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDbEIsT0FBTyxFQUFFLHVDQUF1QyxHQUFHLE1BQU07UUFDekQsWUFBWSxFQUFFLElBQUk7S0FDbkIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgaXNBbmRyb2lkLCBpc0lPUyB9IGZyb20gXCJwbGF0Zm9ybVwiO1xuaW1wb3J0IHtyZWdpc3RlckVsZW1lbnR9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9lbGVtZW50LXJlZ2lzdHJ5XCI7XG5pbXBvcnQgKiBhcyBnZW9sb2NhdGlvbiBmcm9tIFwibmF0aXZlc2NyaXB0LWdlb2xvY2F0aW9uXCI7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCJjb2xvclwiO1xuXG52YXIgbWFwc01vZHVsZSA9IHJlcXVpcmUoXCJuYXRpdmVzY3JpcHQtZ29vZ2xlLW1hcHMtc2RrXCIpO1xudmFyIGRpYWxvZ3NNb2R1bGUgPSByZXF1aXJlKFwidWkvZGlhbG9nc1wiKTtcblxudmFyIHdhdGNoSWQ6IGFueTtcbnZhciBjdXJyZW50UG9zaXRpb246IExvY2F0aW9uO1xudmFyIGNvbGxlY3REaXN0YW5jZTogbnVtYmVyOyAvL2Rpc3RhbmNlIGluIG0gb24gaG93IGNsb3NlIHRvIGVuYWJsZSBjb2xsZWN0LXByb3BlcnR5XG52YXIgbWFwVmlldzogYW55O1xudmFyIGNvbGxlY3RlZE1hcmtlcnMgPSBbXTtcbi8vdmFyIF9jdXJyZW50UG9zaXRpb246IGFueTtcblxucmVnaXN0ZXJFbGVtZW50KFwiTWFwVmlld1wiLCAoKSA9PiByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKS5NYXBWaWV3KTtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm1hcC1wYWdlXCIsXG4gIHRlbXBsYXRlVXJsOiBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmh0bWxcIixcbiAgc3R5bGVVcmxzOiBbXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS1jb21tb24uY3NzXCIsIFwicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UuY3NzXCJdXG59KVxuXG4vKmV4cG9ydCBmdW5jdGlvbiBwdWJsaWMgc3RhcnRXYXRjaCgpIHtcbiAgICB2YXIgd2F0Y2hJZCA9IGdlb2xvY2F0aW9uLndhdGNoTG9jYXRpb24oXG4gICAgZnVuY3Rpb24gKGxvYykge1xuICAgICAgICBpZiAobG9jKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlY2VpdmVkIGxvY2F0aW9uOiBcIiArIGxvYyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGZ1bmN0aW9uKGUpe1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIGUubWVzc2FnZSk7XG4gICAgfSxcbiAgICB7ZGVzaXJlZEFjY3VyYWN5OiAzLCB1cGRhdGVEaXN0YW5jZTogMTAsIG1pbmltdW1VcGRhdGVUaW1lIDogMTAwMCAqIDIwfSk7IC8vIFNob3VsZCB1cGRhdGUgZXZlcnkgMjAgc2Vjb25kcyBhY2NvcmRpbmcgdG8gR29vZ2UgZG9jdW1lbnRhdGlvbi4gTm90IHZlcmlmaWVkLlxufSovXG5cbmV4cG9ydCBjbGFzcyBNYXBQYWdlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQFZpZXdDaGlsZChcIk1hcFZpZXdcIikgbWFwVmlldzogRWxlbWVudFJlZjtcblxuICBsYXRpdHVkZTogbnVtYmVyO1xuICBsb25naXR1ZGU6IG51bWJlcjtcbiAgYWx0aXR1ZGU6IG51bWJlcjtcbiAgX2N1cnJlbnRQb3NpdGlvbjogYW55O1xuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIFRPRE86IExvYWRlclxuICAgIC8vdGhpcy5zdGFydFdhdGNoKCk7XG4gIH1cblxuICAvL01hcCBldmVudHNcbiAgb25NYXBSZWFkeSA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTWFwIFJlYWR5XCIpO1xuICAgIHN0YXJ0V2F0Y2goZXZlbnQpO1xuXG4gICAgLy8gQ2hlY2sgaWYgbG9jYXRpb24gc2VydmljZXMgYXJlIGVuYWJsZWRcbiAgICBpZiAoIWdlb2xvY2F0aW9uLmlzRW5hYmxlZCgpKSB7XG4gICAgICAgIGdlb2xvY2F0aW9uLmVuYWJsZUxvY2F0aW9uUmVxdWVzdCgpO1xuICAgIH0gZWxzZSBjb25zb2xlLmxvZyhcIkFsbGVzIGluIE9yZG51bmdcIik7XG5cbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgICB2YXIgZ01hcCA9IG1hcFZpZXcuZ01hcDtcblxuICAgIHZhciBtYXJrZXIgPSBuZXcgbWFwc01vZHVsZS5NYXJrZXIoKTtcbiAgICBtYXJrZXIucG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyg2Mi4yMzA4OTEyLCAyNS43MzQzODUzKTtcbiAgICBtYXJrZXIudGl0bGUgPSBcIk1hdHRpbGFubmllbWlcIjtcbiAgICBtYXJrZXIuc25pcHBldCA9IFwiVW5pdmVyc2l0eSBDYW1wdXNcIjtcbiAgICBtYXJrZXIudXNlckRhdGEgPSB7aW5kZXg6IDF9O1xuICAgIG1hcFZpZXcuYWRkTWFya2VyKG1hcmtlcik7XG4vKlxuICAgIHZhciBjaXJjbGUgPSBuZXcgbWFwc01vZHVsZS5DaXJjbGUoKTtcbiAgICBjaXJjbGUuY2VudGVyID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcoNjIuMjMsIDI1LjczKTtcbiAgICBjaXJjbGUudmlzaWJsZSA9IHRydWU7XG4gICAgY2lyY2xlLnJhZGl1cyA9IDUwO1xuICAgIGNpcmNsZS5maWxsQ29sb3IgPSBuZXcgQ29sb3IoJyM5OWZmODgwMCcpO1xuICAgIGNpcmNsZS5zdHJva2VDb2xvciA9IG5ldyBDb2xvcignIzk5ZmYwMDAwJyk7XG4gICAgY2lyY2xlLnN0cm9rZVdpZHRoID0gMjtcbiAgICBtYXBWaWV3LmFkZENpcmNsZShjaXJjbGUpO1xuKi9cbiAgfTtcblxuICBvbkNvb3JkaW5hdGVMb25nUHJlc3MgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIkxvbmdQcmVzc1wiKTtcblxuICAgIHZhciBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xuICAgIHZhciBsYXQgPSBldmVudC5wb3NpdGlvbi5sYXRpdHVkZTtcbiAgICB2YXIgbG5nID0gZXZlbnQucG9zaXRpb24ubG9uZ2l0dWRlO1xuXG4gICAgY29uc29sZS5sb2coXCJUYXBwZWQgbG9jYXRpb246IFxcblxcdExhdGl0dWRlOiBcIiArIGV2ZW50LnBvc2l0aW9uLmxhdGl0dWRlICtcbiAgICAgICAgICAgICAgICAgICAgXCJcXG5cXHRMb25naXR1ZGU6IFwiICsgZXZlbnQucG9zaXRpb24ubG9uZ2l0dWRlKTtcblxuICAgIHZhciBtYXJrZXIgPSBuZXcgbWFwc01vZHVsZS5NYXJrZXIoKTtcbiAgICBtYXJrZXIucG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyhsYXQsIGxuZyk7XG4gICAgbWFya2VyLnRpdGxlID0gXCJXZW50dXJlIHBvaW50XCI7XG4gICAgbWFya2VyLnNuaXBwZXQgPSBcIlwiO1xuICAgIG1hcmtlci5kcmFnZ2FibGUgPSB0cnVlO1xuICAgIG1hcmtlci51c2VyRGF0YSA9IHtpbmRleDogMX07XG4gICAgbWFwVmlldy5hZGRNYXJrZXIobWFya2VyKTtcbiAgfTtcblxuICBvbk1hcmtlclNlbGVjdCA9IChldmVudCkgPT4ge1xuXG4gICAgaW50ZXJmYWNlIFBvc2l0aW9uT2JqZWN0IHtcbiAgICAgIFwibGF0aXR1ZGVcIjogc3RyaW5nLFxuICAgICAgXCJsb25naXR1ZGVcIjogc3RyaW5nXG4gICAgfVxuXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG5cbiAgICBsZXQgbWFya2VyUG9zID0gSlNPTi5zdHJpbmdpZnkoZXZlbnQubWFya2VyLnBvc2l0aW9uKTtcbiAgICBsZXQgY3VycmVudFBvcyA9IEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbik7XG4gICAgbGV0IGRpc3RhbmNlID0gZ2V0RGlzdGFuY2VUbyhldmVudC5tYXJrZXIpO1xuXG4gICAgZXZlbnQubWFya2VyLnNuaXBwZXQgPSBcIkRpc3RhbmNlOiBcIiArIGRpc3RhbmNlLnRvRml4ZWQoMCkgKyBcIiBtXCI7XG5cbiAgICBjb25zb2xlLmxvZyhcIlxcblxcdE1hcmtlclNlbGVjdDogXCIgKyBldmVudC5tYXJrZXIudGl0bGVcbiAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRNYXJrZXIgcG9zaXRpb246IFwiICsgbWFya2VyUG9zXG4gICAgICAgICAgICAgICAgICArIFwiXFxuXFx0Q3VycmVudCBwb3NpdGlvbjogXCIgKyBjdXJyZW50UG9zXG4gICAgICAgICAgICAgICAgICArIFwiXFxuXFx0RGlzdGFuY2UgdG8gbWFya2VyOiBcIiArIGRpc3RhbmNlLnRvRml4ZWQoMikgKyBcIm1cIik7XG5cbiAgICAvLyBUaGlzIG1pZ2h0IGJlIHN0dXBpZCwgYnV0IHdvcmtzIGZvciBub3cgOilcbiAgICAvL1RPRE86IGFkZGluZyBjb2xsZWN0ZWQgbWFya2VyIHRvIGEgbGlzdCBldGMuIGI0IHJlbW92aW5nXG4gICAgZnVuY3Rpb24gY29sbGVjdE1hcmtlcihtYXJrKSB7XG4gICAgICBjb2xsZWN0RGlzdGFuY2UgPSA1MDtcbiAgICAgIGlmKGdldERpc3RhbmNlVG8obWFyaykgPCBjb2xsZWN0RGlzdGFuY2UpIHtcbiAgICAgICAgbGV0IGFtb3VudCA9IGhvd01hbnlDb2xsZWN0ZWQoKTtcbiAgICAgICAgY29sbGVjdChhbW91bnQpO1xuICAgICAgICAvL2FsZXJ0KFwiVmVudHVyZSBwb2ludCBjb2xsZWN0ZWQuIFxcbkNvbGxlY3RlZDogXCIgKyBhbW91bnQpO1xuICAgICAgICBjb2xsZWN0ZWRNYXJrZXJzLnB1c2gobWFyayk7XG4gICAgICAgIG1hcFZpZXcucmVtb3ZlTWFya2VyKG1hcmspO1xuICAgICAgICBjb25zb2xlLmxvZyhcIllvdSBoYXZlIFwiICsgY29sbGVjdGVkTWFya2Vycy5sZW5ndGggKyBcIiBjb2xsZWN0ZWQgbWFya2Vycy5cIilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiXFxuTWFya2VyIHRvbyBmYXIgYXdheSwgbW92ZSBjbG9zZXIuXCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbGxlY3RNYXJrZXIoZXZlbnQubWFya2VyKTtcblxuICB9O1xuXG4gIG9uTWFya2VyQmVnaW5EcmFnZ2luZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyQmVnaW5EcmFnZ2luZ1wiKTtcbiAgfTtcblxuICBvbk1hcmtlckVuZERyYWdnaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJFbmREcmFnZ2luZ1wiKTtcbiAgfTtcblxuICBvbk1hcmtlckRyYWcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckRyYWdcIik7XG4gIH07XG5cbiAgb25DYW1lcmFDaGFuZ2VkID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJDYW1lcmFDaGFuZ2VcIik7XG4gIH07XG5cbiAgb25TaGFwZVNlbGVjdCA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiWW91ciBjdXJyZW50IHBvc2l0aW9uIGlzOiBcIiArIEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbikpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRXYXRjaChldmVudCkge1xuXG4gIGludGVyZmFjZSBMb2NhdGlvbk9iamVjdCB7XG4gICAgXCJsYXRpdHVkZVwiOiBudW1iZXIsXG4gICAgXCJsb25naXR1ZGVcIjogbnVtYmVyLFxuICAgIFwiYWx0aXR1ZGVcIjogbnVtYmVyLFxuICAgIFwiaG9yaXpvbnRhbEFjY3VyYWN5XCI6IG51bWJlcixcbiAgICBcInZlcnRpY2FsQWNjdXJhY3lcIjogbnVtYmVyLFxuICAgIFwic3BlZWRcIjogbnVtYmVyLFxuICAgIFwiZGlyZWN0aW9uXCI6IG51bWJlcixcbiAgICBcInRpbWVzdGFtcFwiOnN0cmluZ1xuICB9XG5cbiAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG5cbiAgd2F0Y2hJZCA9IGdlb2xvY2F0aW9uLndhdGNoTG9jYXRpb24oXG4gIGZ1bmN0aW9uIChsb2MpIHtcbiAgICAgIGlmIChsb2MpIHtcbiAgICAgICAgICBsZXQgb2JqOiBMb2NhdGlvbk9iamVjdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobG9jKSk7XG4gICAgICAgICAgdGhpcy5sYXRpdHVkZSA9IG9iai5sYXRpdHVkZTtcbiAgICAgICAgICB0aGlzLmxvbmdpdHVkZSA9IG9iai5sb25naXR1ZGU7XG4gICAgICAgICAgdGhpcy5hbHRpdHVkZSA9IG9iai5hbHRpdHVkZTtcbiAgICAgICAgICAvKnZhciovY3VycmVudFBvc2l0aW9uID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcob2JqLmxhdGl0dWRlLCBvYmoubG9uZ2l0dWRlKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhuZXcgRGF0ZSgpICsgXCJcXG5SZWNlaXZlZCBsb2NhdGlvbjpcXG5cXHRMYXRpdHVkZTogXCIgKyBvYmoubGF0aXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRMb25naXR1ZGU6IFwiICsgb2JqLmxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdEFsdGl0dWRlOiBcIiArIG9iai5hbHRpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdFRpbWVzdGFtcDogXCIgKyBvYmoudGltZXN0YW1wXG4gICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0RGlyZWN0aW9uOiBcIiArIG9iai5kaXJlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXG5DdXJyZW50UG9zOiBcIiArIEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbikpO1xuXG4gICAgICAgICAgdmFyIGNpcmNsZSA9IG5ldyBtYXBzTW9kdWxlLkNpcmNsZSgpO1xuICAgICAgICAgIGNpcmNsZS5jZW50ZXIgPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyh0aGlzLmxhdGl0dWRlLCB0aGlzLmxvbmdpdHVkZSk7XG4gICAgICAgICAgY2lyY2xlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgIGNpcmNsZS5yYWRpdXMgPSAyMDtcbiAgICAgICAgICBjaXJjbGUuZmlsbENvbG9yID0gbmV3IENvbG9yKCcjNmM5ZGYwJyk7IC8vIzk5ZmY4ODAwXG4gICAgICAgICAgY2lyY2xlLnN0cm9rZUNvbG9yID0gbmV3IENvbG9yKCcjMzk2YWJkJyk7IC8vIzk5ZmYwMDAwXG4gICAgICAgICAgY2lyY2xlLnN0cm9rZVdpZHRoID0gMjtcbiAgICAgICAgICBjaXJjbGUuY2xpY2thYmxlID0gdHJ1ZTtcbiAgICAgICAgICBtYXBWaWV3LmFkZENpcmNsZShjaXJjbGUpO1xuICAgICAgICAgIG1hcFZpZXcubGF0aXR1ZGUgPSB0aGlzLmxhdGl0dWRlO1xuICAgICAgICAgIG1hcFZpZXcubG9uZ2l0dWRlID0gdGhpcy5sb25naXR1ZGU7XG5cbiAgICAgIH1cbiAgfSxcbiAgZnVuY3Rpb24oZSl7XG4gICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIGUubWVzc2FnZSk7XG4gIH0sXG4gIHtkZXNpcmVkQWNjdXJhY3k6IDMsIHVwZGF0ZURpc3RhbmNlOiAxMCwgbWluaW11bVVwZGF0ZVRpbWUgOiAxMDAwICogMn0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kV2F0Y2goKSB7XG4gICAgaWYgKHdhdGNoSWQpIHtcbiAgICAgICAgZ2VvbG9jYXRpb24uY2xlYXJXYXRjaCh3YXRjaElkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJNeSB3YXRjaCBpcyBlbmRlZC4uLiBULiBKb24gU25vd1wiKTtcbiAgICB9XG59XG5cbi8vIFRPRE86IHRvaW1pbWFhbiBhbmRyb2lkaWxsZSBrYW5zc2FcbmZ1bmN0aW9uIGdldERpc3RhbmNlVG8ob2JqKSB7XG4gIGxldCBvYmpQb3MgPSBKU09OLnN0cmluZ2lmeShvYmoucG9zaXRpb24pO1xuICBsZXQgY3VycmVudFBvcyA9IEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbik7XG4gIGxldCBkaXN0YW5jZSA9IG51bGw7XG5cbiAgaWYoaXNJT1MpIHtcbiAgICAvL2NvbnNvbGUubG9nKFwiUnVubmluZyBvbiBpb3MuXCIpXG4gICAgZGlzdGFuY2UgPSBnZW9sb2NhdGlvbi5kaXN0YW5jZShKU09OLnBhcnNlKG9ialBvcykuX2lvcywgSlNPTi5wYXJzZShjdXJyZW50UG9zKS5faW9zKTtcbiAgfSBlbHNlIGlmKGlzQW5kcm9pZCkge1xuICAgIGNvbnNvbGUubG9nKFwiUnVubmluZyBvbiBhbmRyb2lkLlwiKTtcbiAgICBkaXN0YW5jZSA9IGdlb2xvY2F0aW9uLmRpc3RhbmNlKEpTT04ucGFyc2Uob2JqUG9zKS5fYW5kcm9pZCwgSlNPTi5wYXJzZShjdXJyZW50UG9zKS5fYW5kcm9pZCk7XG4gIH0gZWxzZSB7XG4gICAgZGlzdGFuY2UgPSBcImVycm9yXCI7XG4gICAgY29uc29sZS5sb2coXCJDb3VsZCBub3QgZmluZCBkaXN0YW5jZS5cIik7XG4gIH1cbiAgICByZXR1cm4gZGlzdGFuY2U7XG59XG5cbmZ1bmN0aW9uIGhvd01hbnlDb2xsZWN0ZWQoKSB7XG4gIHJldHVybiBjb2xsZWN0ZWRNYXJrZXJzLmxlbmd0aCArIDE7XG59XG5cbi8vaGFuZGxlcyB0aGUgY29sbGVjdGlvbiBhbmQgcmV0dXJucyBtZXNzYWdlXG5mdW5jdGlvbiBjb2xsZWN0KGFtb3VudCkge1xuICBkaWFsb2dzTW9kdWxlLmFsZXJ0KHtcbiAgICBtZXNzYWdlOiBcIldlbnR1cmUgcG9pbnQgY29sbGVjdGVkISBcXG5Zb3UgaGF2ZTogXCIgKyBhbW91bnQsXG4gICAgb2tCdXR0b25UZXh0OiBcIk9LXCJcbiAgfSk7XG59XG4iXX0=