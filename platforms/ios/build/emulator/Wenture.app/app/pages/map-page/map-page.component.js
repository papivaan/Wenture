"use strict";
var core_1 = require("@angular/core");
var platform_1 = require("platform");
var element_registry_1 = require("nativescript-angular/element-registry");
var geolocation = require("nativescript-geolocation");
var color_1 = require("color");
var mapsModule = require("nativescript-google-maps-sdk");
var dialogsModule = require("ui/dialogs");
var Image = require("ui/image").Image;
var imageSource = require("image-source");
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
            var icon = new Image();
            icon.imageSource = imageSource.fromResource('icon');
            marker.icon = icon;
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
            //Androidilla toimii. Iosille pitää katsoa miten resource toimii. PC:llä ei pystytä testaamaan
            //Ikonia joutuu hiemna muokkaamaan(pienemmäksi ja lisätään pieni osoitin alalaitaan)
            var icon = new Image();
            icon.imageSource = imageSource.fromResource('icon');
            marker.icon = icon;
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
        distance = 3; //geolocation.distance(JSON.parse(objPos)._android, JSON.parse(currentPos)._android);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBeUU7QUFDekUscUNBQTRDO0FBQzVDLDBFQUFzRTtBQUN0RSxzREFBd0Q7QUFDeEQsK0JBQThCO0FBSTlCLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ3pELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMxQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3RDLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUkxQyxJQUFJLE9BQVksQ0FBQztBQUNqQixJQUFJLGVBQXlCLENBQUM7QUFDOUIsSUFBSSxlQUF1QixDQUFDLENBQUMsdURBQXVEO0FBQ3BGLElBQUksT0FBWSxDQUFDO0FBQ2pCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzFCLDRCQUE0QjtBQUU1QixrQ0FBZSxDQUFDLFNBQVMsRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsT0FBTyxFQUEvQyxDQUErQyxDQUFDLENBQUM7QUFxQmxGLElBQWEsZ0JBQWdCO0lBbkI3QjtRQWdDRSxZQUFZO1FBQ1osZUFBVSxHQUFHLFVBQUMsS0FBSztZQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3pCLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVsQix5Q0FBeUM7WUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixXQUFXLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUN4QyxDQUFDO1lBQUMsSUFBSTtnQkFBQyxPQUFPLENBQUMsR0FBRyxD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QXFCLENBQUMsQ0FBQztRQUNuQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUEscUZBQXFGO0lBQ3BHLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFDQyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFFRDtJQUNFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFFRCw0Q0FBNEM7QUFDNUMsaUJBQWlCLE1BQU07SUFDckIsYUFBYSxDQUFDLEtBQUssQ0FBQztRQUNsQixPQUFPLEVBQUUsdUNBQXVDLEdBQUcsTUFBTTtRQUN6RCxZQUFZLEVBQUUsSUFBSTtLQUNuQixDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBPbkluaXQsIFZpZXdDaGlsZCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBpc0FuZHJvaWQsIGlzSU9TIH0gZnJvbSBcInBsYXRmb3JtXCI7XG5pbXBvcnQge3JlZ2lzdGVyRWxlbWVudH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL2VsZW1lbnQtcmVnaXN0cnlcIjtcbmltcG9ydCAqIGFzIGdlb2xvY2F0aW9uIGZyb20gXCJuYXRpdmVzY3JpcHQtZ2VvbG9jYXRpb25cIjtcbmltcG9ydCB7IENvbG9yIH0gZnJvbSBcImNvbG9yXCI7XG4vL2ltcG9ydCB7IEltYWdlIH0gZnJvbSBcInVpL2ltYWdlXCI7XG5pbXBvcnQgeyBJbWFnZVNvdXJjZSB9IGZyb20gXCJpbWFnZS1zb3VyY2VcIjtcblxudmFyIG1hcHNNb2R1bGUgPSByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKTtcbnZhciBkaWFsb2dzTW9kdWxlID0gcmVxdWlyZShcInVpL2RpYWxvZ3NcIik7XG52YXIgSW1hZ2UgPSByZXF1aXJlKFwidWkvaW1hZ2VcIikuSW1hZ2U7XG52YXIgaW1hZ2VTb3VyY2UgPSByZXF1aXJlKFwiaW1hZ2Utc291cmNlXCIpO1xuXG5cblxudmFyIHdhdGNoSWQ6IGFueTtcbnZhciBjdXJyZW50UG9zaXRpb246IExvY2F0aW9uO1xudmFyIGNvbGxlY3REaXN0YW5jZTogbnVtYmVyOyAvL2Rpc3RhbmNlIGluIG0gb24gaG93IGNsb3NlIHRvIGVuYWJsZSBjb2xsZWN0LXByb3BlcnR5XG52YXIgbWFwVmlldzogYW55O1xudmFyIGNvbGxlY3RlZE1hcmtlcnMgPSBbXTtcbi8vdmFyIF9jdXJyZW50UG9zaXRpb246IGFueTtcblxucmVnaXN0ZXJFbGVtZW50KFwiTWFwVmlld1wiLCAoKSA9PiByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKS5NYXBWaWV3KTtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm1hcC1wYWdlXCIsXG4gIHRlbXBsYXRlVXJsOiBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmh0bWxcIixcbiAgc3R5bGVVcmxzOiBbXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS1jb21tb24uY3NzXCIsIFwicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UuY3NzXCJdXG59KVxuXG4vKmV4cG9ydCBmdW5jdGlvbiBwdWJsaWMgc3RhcnRXYXRjaCgpIHtcbiAgICB2YXIgd2F0Y2hJZCA9IGdlb2xvY2F0aW9uLndhdGNoTG9jYXRpb24oXG4gICAgZnVuY3Rpb24gKGxvYykge1xuICAgICAgICBpZiAobG9jKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlY2VpdmVkIGxvY2F0aW9uOiBcIiArIGxvYyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGZ1bmN0aW9uKGUpe1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIGUubWVzc2FnZSk7XG4gICAgfSxcbiAgICB7ZGVzaXJlZEFjY3VyYWN5OiAzLCB1cGRhdGVEaXN0YW5jZTogMTAsIG1pbmltdW1VcGRhdGVUaW1lIDogMTAwMCAqIDIwfSk7IC8vIFNob3VsZCB1cGRhdGUgZXZlcnkgMjAgc2Vjb25kcyBhY2NvcmRpbmcgdG8gR29vZ2UgZG9jdW1lbnRhdGlvbi4gTm90IHZlcmlmaWVkLlxufSovXG5cbmV4cG9ydCBjbGFzcyBNYXBQYWdlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQFZpZXdDaGlsZChcIk1hcFZpZXdcIikgbWFwVmlldzogRWxlbWVudFJlZjtcblxuICBsYXRpdHVkZTogbnVtYmVyO1xuICBsb25naXR1ZGU6IG51bWJlcjtcbiAgYWx0aXR1ZGU6IG51bWJlcjtcbiAgX2N1cnJlbnRQb3NpdGlvbjogYW55O1xuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIFRPRE86IExvYWRlclxuICAgIC8vdGhpcy5zdGFydFdhdGNoKCk7XG4gIH1cblxuICAvL01hcCBldmVudHNcbiAgb25NYXBSZWFkeSA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTWFwIFJlYWR5XCIpO1xuICAgIHN0YXJ0V2F0Y2goZXZlbnQpO1xuXG4gICAgLy8gQ2hlY2sgaWYgbG9jYXRpb24gc2VydmljZXMgYXJlIGVuYWJsZWRcbiAgICBpZiAoIWdlb2xvY2F0aW9uLmlzRW5hYmxlZCgpKSB7XG4gICAgICAgIGdlb2xvY2F0aW9uLmVuYWJsZUxvY2F0aW9uUmVxdWVzdCgpO1xuICAgIH0gZWxzZSBjb25zb2xlLmxvZyhcIkFsbGVzIGluIE9yZG51bmdcIik7XG5cbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgICB2YXIgZ01hcCA9IG1hcFZpZXcuZ01hcDtcblxuICAgIHZhciBtYXJrZXIgPSBuZXcgbWFwc01vZHVsZS5NYXJrZXIoKTtcbiAgICBtYXJrZXIucG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyg2Mi4yMzA4OTEyLCAyNS43MzQzODUzKTtcbiAgICBtYXJrZXIudGl0bGUgPSBcIk1hdHRpbGFubmllbWlcIjtcbiAgICBtYXJrZXIuc25pcHBldCA9IFwiVW5pdmVyc2l0eSBDYW1wdXNcIjtcbiAgICB2YXIgaWNvbiA9IG5ldyBJbWFnZSgpO1xuICAgIGljb24uaW1hZ2VTb3VyY2UgPSBpbWFnZVNvdXJjZS5mcm9tUmVzb3VyY2UoJ2ljb24nKTtcbiAgICBtYXJrZXIuaWNvbiA9IGljb247XG4gICAgbWFya2VyLnVzZXJEYXRhID0ge2luZGV4OiAxfTtcbiAgICBtYXBWaWV3LmFkZE1hcmtlcihtYXJrZXIpO1xuLypcbiAgICB2YXIgY2lyY2xlID0gbmV3IG1hcHNNb2R1bGUuQ2lyY2xlKCk7XG4gICAgY2lyY2xlLmNlbnRlciA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKDYyLjIzLCAyNS43Myk7XG4gICAgY2lyY2xlLnZpc2libGUgPSB0cnVlO1xuICAgIGNpcmNsZS5yYWRpdXMgPSA1MDtcbiAgICBjaXJjbGUuZmlsbENvbG9yID0gbmV3IENvbG9yKCcjOTlmZjg4MDAnKTtcbiAgICBjaXJjbGUuc3Ryb2tlQ29sb3IgPSBuZXcgQ29sb3IoJyM5OWZmMDAwMCcpO1xuICAgIGNpcmNsZS5zdHJva2VXaWR0aCA9IDI7XG4gICAgbWFwVmlldy5hZGRDaXJjbGUoY2lyY2xlKTtcbiovXG4gIH07XG5cbiAgb25Db29yZGluYXRlTG9uZ1ByZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJMb25nUHJlc3NcIik7XG5cbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgICB2YXIgbGF0ID0gZXZlbnQucG9zaXRpb24ubGF0aXR1ZGU7XG4gICAgdmFyIGxuZyA9IGV2ZW50LnBvc2l0aW9uLmxvbmdpdHVkZTtcblxuICAgIGNvbnNvbGUubG9nKFwiVGFwcGVkIGxvY2F0aW9uOiBcXG5cXHRMYXRpdHVkZTogXCIgKyBldmVudC5wb3NpdGlvbi5sYXRpdHVkZSArXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuXFx0TG9uZ2l0dWRlOiBcIiArIGV2ZW50LnBvc2l0aW9uLmxvbmdpdHVkZSk7XG5cbiAgICB2YXIgbWFya2VyID0gbmV3IG1hcHNNb2R1bGUuTWFya2VyKCk7XG4gICAgbWFya2VyLnBvc2l0aW9uID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcobGF0LCBsbmcpO1xuICAgIG1hcmtlci50aXRsZSA9IFwiV2VudHVyZSBwb2ludFwiO1xuICAgIG1hcmtlci5zbmlwcGV0ID0gXCJcIjtcbiAgICAvL0FuZHJvaWRpbGxhIHRvaW1paS4gSW9zaWxsZSBwaXTDpMOkIGthdHNvYSBtaXRlbiByZXNvdXJjZSB0b2ltaWkuIFBDOmxsw6QgZWkgcHlzdHl0w6QgdGVzdGFhbWFhblxuICAgIC8vSWtvbmlhIGpvdXR1dSBoaWVtbmEgbXVva2thYW1hYW4ocGllbmVtbcOka3NpIGphIGxpc8OkdMOkw6RuIHBpZW5pIG9zb2l0aW4gYWxhbGFpdGFhbilcbiAgICB2YXIgaWNvbiA9IG5ldyBJbWFnZSgpO1xuICAgIGljb24uaW1hZ2VTb3VyY2UgPSBpbWFnZVNvdXJjZS5mcm9tUmVzb3VyY2UoJ2ljb24nKTtcbiAgICBtYXJrZXIuaWNvbiA9IGljb247XG4gICAgbWFya2VyLmRyYWdnYWJsZSA9IHRydWU7XG4gICAgbWFya2VyLnVzZXJEYXRhID0ge2luZGV4OiAxfTtcbiAgICBtYXBWaWV3LmFkZE1hcmtlcihtYXJrZXIpO1xuICB9O1xuXG4gIG9uTWFya2VyU2VsZWN0ID0gKGV2ZW50KSA9PiB7XG5cbiAgICBpbnRlcmZhY2UgUG9zaXRpb25PYmplY3Qge1xuICAgICAgXCJsYXRpdHVkZVwiOiBzdHJpbmcsXG4gICAgICBcImxvbmdpdHVkZVwiOiBzdHJpbmdcbiAgICB9XG5cbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcblxuICAgIGxldCBtYXJrZXJQb3MgPSBKU09OLnN0cmluZ2lmeShldmVudC5tYXJrZXIucG9zaXRpb24pO1xuICAgIGxldCBjdXJyZW50UG9zID0gSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKTtcbiAgICBsZXQgZGlzdGFuY2UgPSBnZXREaXN0YW5jZVRvKGV2ZW50Lm1hcmtlcik7XG5cbiAgICBldmVudC5tYXJrZXIuc25pcHBldCA9IFwiRGlzdGFuY2U6IFwiICsgZGlzdGFuY2UudG9GaXhlZCgwKSArIFwiIG1cIjtcblxuICAgIGNvbnNvbGUubG9nKFwiXFxuXFx0TWFya2VyU2VsZWN0OiBcIiArIGV2ZW50Lm1hcmtlci50aXRsZVxuICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdE1hcmtlciBwb3NpdGlvbjogXCIgKyBtYXJrZXJQb3NcbiAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRDdXJyZW50IHBvc2l0aW9uOiBcIiArIGN1cnJlbnRQb3NcbiAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHREaXN0YW5jZSB0byBtYXJrZXI6IFwiICsgZGlzdGFuY2UudG9GaXhlZCgyKSArIFwibVwiKTtcblxuICAgIC8vIFRoaXMgbWlnaHQgYmUgc3R1cGlkLCBidXQgd29ya3MgZm9yIG5vdyA6KVxuICAgIC8vVE9ETzogYWRkaW5nIGNvbGxlY3RlZCBtYXJrZXIgdG8gYSBsaXN0IGV0Yy4gYjQgcmVtb3ZpbmdcbiAgICBmdW5jdGlvbiBjb2xsZWN0TWFya2VyKG1hcmspIHtcbiAgICAgIGNvbGxlY3REaXN0YW5jZSA9IDUwO1xuICAgICAgaWYoZ2V0RGlzdGFuY2VUbyhtYXJrKSA8IGNvbGxlY3REaXN0YW5jZSkge1xuICAgICAgICBsZXQgYW1vdW50ID0gaG93TWFueUNvbGxlY3RlZCgpO1xuICAgICAgICBjb2xsZWN0KGFtb3VudCk7XG4gICAgICAgIC8vYWxlcnQoXCJWZW50dXJlIHBvaW50IGNvbGxlY3RlZC4gXFxuQ29sbGVjdGVkOiBcIiArIGFtb3VudCk7XG4gICAgICAgIGNvbGxlY3RlZE1hcmtlcnMucHVzaChtYXJrKTtcbiAgICAgICAgbWFwVmlldy5yZW1vdmVNYXJrZXIobWFyayk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiWW91IGhhdmUgXCIgKyBjb2xsZWN0ZWRNYXJrZXJzLmxlbmd0aCArIFwiIGNvbGxlY3RlZCBtYXJrZXJzLlwiKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJcXG5NYXJrZXIgdG9vIGZhciBhd2F5LCBtb3ZlIGNsb3Nlci5cIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29sbGVjdE1hcmtlcihldmVudC5tYXJrZXIpO1xuXG4gIH07XG5cbiAgb25NYXJrZXJCZWdpbkRyYWdnaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJCZWdpbkRyYWdnaW5nXCIpO1xuICB9O1xuXG4gIG9uTWFya2VyRW5kRHJhZ2dpbmcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckVuZERyYWdnaW5nXCIpO1xuICB9O1xuXG4gIG9uTWFya2VyRHJhZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyRHJhZ1wiKTtcbiAgfTtcblxuICBvbkNhbWVyYUNoYW5nZWQgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIkNhbWVyYUNoYW5nZVwiKTtcbiAgfTtcblxuICBvblNoYXBlU2VsZWN0ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJZb3VyIGN1cnJlbnQgcG9zaXRpb24gaXM6IFwiICsgSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydFdhdGNoKGV2ZW50KSB7XG5cbiAgaW50ZXJmYWNlIExvY2F0aW9uT2JqZWN0IHtcbiAgICBcImxhdGl0dWRlXCI6IG51bWJlcixcbiAgICBcImxvbmdpdHVkZVwiOiBudW1iZXIsXG4gICAgXCJhbHRpdHVkZVwiOiBudW1iZXIsXG4gICAgXCJob3Jpem9udGFsQWNjdXJhY3lcIjogbnVtYmVyLFxuICAgIFwidmVydGljYWxBY2N1cmFjeVwiOiBudW1iZXIsXG4gICAgXCJzcGVlZFwiOiBudW1iZXIsXG4gICAgXCJkaXJlY3Rpb25cIjogbnVtYmVyLFxuICAgIFwidGltZXN0YW1wXCI6c3RyaW5nXG4gIH1cblxuICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcblxuICB3YXRjaElkID0gZ2VvbG9jYXRpb24ud2F0Y2hMb2NhdGlvbihcbiAgZnVuY3Rpb24gKGxvYykge1xuICAgICAgaWYgKGxvYykge1xuICAgICAgICAgIGxldCBvYmo6IExvY2F0aW9uT2JqZWN0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShsb2MpKTtcbiAgICAgICAgICB0aGlzLmxhdGl0dWRlID0gb2JqLmxhdGl0dWRlO1xuICAgICAgICAgIHRoaXMubG9uZ2l0dWRlID0gb2JqLmxvbmdpdHVkZTtcbiAgICAgICAgICB0aGlzLmFsdGl0dWRlID0gb2JqLmFsdGl0dWRlO1xuICAgICAgICAgIC8qdmFyKi9jdXJyZW50UG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyhvYmoubGF0aXR1ZGUsIG9iai5sb25naXR1ZGUpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKG5ldyBEYXRlKCkgKyBcIlxcblJlY2VpdmVkIGxvY2F0aW9uOlxcblxcdExhdGl0dWRlOiBcIiArIG9iai5sYXRpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdExvbmdpdHVkZTogXCIgKyBvYmoubG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0QWx0aXR1ZGU6IFwiICsgb2JqLmFsdGl0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0VGltZXN0YW1wOiBcIiArIG9iai50aW1lc3RhbXBcbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHREaXJlY3Rpb246IFwiICsgb2JqLmRpcmVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcbkN1cnJlbnRQb3M6IFwiICsgSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKSk7XG5cbiAgICAgICAgICB2YXIgY2lyY2xlID0gbmV3IG1hcHNNb2R1bGUuQ2lyY2xlKCk7XG4gICAgICAgICAgY2lyY2xlLmNlbnRlciA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKHRoaXMubGF0aXR1ZGUsIHRoaXMubG9uZ2l0dWRlKTtcbiAgICAgICAgICBjaXJjbGUudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgY2lyY2xlLnJhZGl1cyA9IDIwO1xuICAgICAgICAgIGNpcmNsZS5maWxsQ29sb3IgPSBuZXcgQ29sb3IoJyM2YzlkZjAnKTsgLy8jOTlmZjg4MDBcbiAgICAgICAgICBjaXJjbGUuc3Ryb2tlQ29sb3IgPSBuZXcgQ29sb3IoJyMzOTZhYmQnKTsgLy8jOTlmZjAwMDBcbiAgICAgICAgICBjaXJjbGUuc3Ryb2tlV2lkdGggPSAyO1xuICAgICAgICAgIGNpcmNsZS5jbGlja2FibGUgPSB0cnVlO1xuICAgICAgICAgIG1hcFZpZXcuYWRkQ2lyY2xlKGNpcmNsZSk7XG4gICAgICAgICAgbWFwVmlldy5sYXRpdHVkZSA9IHRoaXMubGF0aXR1ZGU7XG4gICAgICAgICAgbWFwVmlldy5sb25naXR1ZGUgPSB0aGlzLmxvbmdpdHVkZTtcblxuICAgICAgfVxuICB9LFxuICBmdW5jdGlvbihlKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgZS5tZXNzYWdlKTtcbiAgfSxcbiAge2Rlc2lyZWRBY2N1cmFjeTogMywgdXBkYXRlRGlzdGFuY2U6IDEwLCBtaW5pbXVtVXBkYXRlVGltZSA6IDEwMDAgKiAyfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmRXYXRjaCgpIHtcbiAgICBpZiAod2F0Y2hJZCkge1xuICAgICAgICBnZW9sb2NhdGlvbi5jbGVhcldhdGNoKHdhdGNoSWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIk15IHdhdGNoIGlzIGVuZGVkLi4uIFQuIEpvbiBTbm93XCIpO1xuICAgIH1cbn1cblxuLy8gVE9ETzogdG9pbWltYWFuIGFuZHJvaWRpbGxlIGthbnNzYVxuZnVuY3Rpb24gZ2V0RGlzdGFuY2VUbyhvYmopIHtcbiAgbGV0IG9ialBvcyA9IEpTT04uc3RyaW5naWZ5KG9iai5wb3NpdGlvbik7XG4gIGxldCBjdXJyZW50UG9zID0gSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKTtcbiAgbGV0IGRpc3RhbmNlID0gbnVsbDtcblxuICBpZihpc0lPUykge1xuICAgIC8vY29uc29sZS5sb2coXCJSdW5uaW5nIG9uIGlvcy5cIilcbiAgICBkaXN0YW5jZSA9IGdlb2xvY2F0aW9uLmRpc3RhbmNlKEpTT04ucGFyc2Uob2JqUG9zKS5faW9zLCBKU09OLnBhcnNlKGN1cnJlbnRQb3MpLl9pb3MpO1xuICB9IGVsc2UgaWYoaXNBbmRyb2lkKSB7XG4gICAgY29uc29sZS5sb2coXCJSdW5uaW5nIG9uIGFuZHJvaWQuXCIpO1xuICAgIGRpc3RhbmNlID0gMzsvL2dlb2xvY2F0aW9uLmRpc3RhbmNlKEpTT04ucGFyc2Uob2JqUG9zKS5fYW5kcm9pZCwgSlNPTi5wYXJzZShjdXJyZW50UG9zKS5fYW5kcm9pZCk7XG4gIH0gZWxzZSB7XG4gICAgZGlzdGFuY2UgPSBcImVycm9yXCI7XG4gICAgY29uc29sZS5sb2coXCJDb3VsZCBub3QgZmluZCBkaXN0YW5jZS5cIik7XG4gIH1cbiAgICByZXR1cm4gZGlzdGFuY2U7XG59XG5cbmZ1bmN0aW9uIGhvd01hbnlDb2xsZWN0ZWQoKSB7XG4gIHJldHVybiBjb2xsZWN0ZWRNYXJrZXJzLmxlbmd0aCArIDE7XG59XG5cbi8vaGFuZGxlcyB0aGUgY29sbGVjdGlvbiBhbmQgcmV0dXJucyBtZXNzYWdlXG5mdW5jdGlvbiBjb2xsZWN0KGFtb3VudCkge1xuICBkaWFsb2dzTW9kdWxlLmFsZXJ0KHtcbiAgICBtZXNzYWdlOiBcIldlbnR1cmUgcG9pbnQgY29sbGVjdGVkISBcXG5Zb3UgaGF2ZTogXCIgKyBhbW91bnQsXG4gICAgb2tCdXR0b25UZXh0OiBcIk9LXCJcbiAgfSk7XG59XG4iXX0=