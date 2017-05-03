"use strict";
var core_1 = require("@angular/core");
var platform_1 = require("platform");
var element_registry_1 = require("nativescript-angular/element-registry");
var geolocation = require("nativescript-geolocation");
var router_1 = require("@angular/router");
var page_1 = require("ui/page");
var color_1 = require("color");
var wenturepoint_service_1 = require("../../shared/wenturepoint/wenturepoint.service");
var nativescript_sidedrawer_1 = require("nativescript-sidedrawer");
var mapsModule = require("nativescript-google-maps-sdk");
var dialogsModule = require("ui/dialogs");
var Image = require("ui/image").Image;
var imageSource = require("image-source");
var watchId;
var currentPosition;
var currentPosCircle;
var collectDistance; //distance in m on how close to enable collect-property
var mapView;
var collectedMarkers = [];
element_registry_1.registerElement("MapView", function () { return require("nativescript-google-maps-sdk").MapView; });
var MapPageComponent = (function () {
    function MapPageComponent(router, wenturePointService, page) {
        var _this = this;
        this.router = router;
        this.wenturePointService = wenturePointService;
        this.page = page;
        //i stores the index value of menu
        this.i = 0;
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
            _this.addWenturePoints(mapView);
        };
        this.onCoordinateLongPress = function (event) {
            console.log("LongPress");
            var mapView = event.object;
            var lat = event.position.latitude;
            var lng = event.position.longitude;
            console.log("Tapped location: \n\tLatitude: " + event.position.latitude +
                "\n\tLongitude: " + event.position.longitude);
            /*  Tätä voi käyttää testailuun, jos haluaa lisätä markereita.
                var marker = new mapsModule.Marker();
                marker.position = mapsModule.Position.positionFromLatLng(lat, lng);
                marker.title = "Wenture point";
                marker.snippet = "";
                //Androidilla toimii. Iosille pitää katsoa miten resource toimii. PC:llä ei pystytä testaamaan
                //Ikonia joutuu hiemna muokkaamaan pienemmäksi ja lisätään pieni osoitin alalaitaan)
                var icon = new Image();
                icon.imageSource = imageSource.fromResource('icon');
                marker.icon = icon;
                marker.draggable = true;
                marker.userData = {index: 1};
                mapView.addMarker(marker);
              */
        };
        // TODO: Tämän voisi siirtää johonkin fiksumpaan paikkaan.
        this.TnsSideDrawerOptionsListener = function (index) {
            console.log(index);
        };
        this.onMarkerSelect = function (event) {
            var mapView = event.object;
            var markerPos = JSON.stringify(event.marker.position);
            var currentPos = JSON.stringify(currentPosition);
            var distance = getDistanceTo(event.marker);
            // Change the content of the bottom bar text
            _this.wenturePointTitle = event.marker.title;
            for (var i = 0; i < _this.wenturePointService.getPoints().length; i++) {
                if (event.marker.title === _this.wenturePointService.getPoints().getItem(i).title) {
                    _this.wenturePointInfo = _this.wenturePointService.getPoints().getItem(i).info;
                    console.log("\t" + _this.wenturePointService.getPoints().getItem(i).info);
                }
            }
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
            console.log("Wenture Points:");
            for (var i = 0; i < _this.wenturePointService.getPoints().length; i++) {
                console.log("\t" + JSON.stringify(_this.wenturePointService.getPoints().getItem(i)));
            }
        };
        this.onShapeSelect = function (event) {
            console.log("Your current position is: " + JSON.stringify(currentPosition));
        };
    }
    MapPageComponent.prototype.ngOnInit = function () {
        var _this = this;
        // TODO: Loader?
        // TODO: menuitem iconit puuttuu, actionbarin mahd piilottaminen(?)
        nativescript_sidedrawer_1.TnsSideDrawer.build({
            templates: [{
                    title: 'Wenturepoints',
                }, {
                    title: 'Routes',
                }, {
                    title: 'My Wentures',
                }, {
                    title: 'Settings',
                }, {
                    title: 'Log out',
                }],
            title: 'Wenture',
            subtitle: 'your urban adventure!',
            listener: function (index) {
                _this.i = index;
            },
            context: this,
        });
    };
    MapPageComponent.prototype.toggleSideDrawer = function () {
        nativescript_sidedrawer_1.TnsSideDrawer.toggle();
    };
    MapPageComponent.prototype.collectButtonTapped = function () {
        // TODO: Tähän se keräystoiminto, if distance jtn, niin tuolta toi collect()
        alert("Not yet implemented.");
    };
    MapPageComponent.prototype.addWenturePoints = function (mapView) {
        for (var i = 0; i < this.wenturePointService.getPoints().length; i++) {
            var wPoint = this.wenturePointService.getPoints().getItem(i);
            var marker = new mapsModule.Marker();
            marker.position = mapsModule.Position.positionFromLatLng(wPoint.lat, wPoint.lng);
            marker.title = wPoint.title;
            marker.snippet = "";
            //Androidilla toimii. Iosille pitää katsoa miten resource toimii. PC:llä ei pystytä testaamaan
            //Ikonia joutuu hiemna muokkaamaan(pienemmäksi ja lisätään pieni osoitin alalaitaan)
            var icon = new Image();
            icon.imageSource = imageSource.fromResource('icon');
            marker.icon = icon;
            marker.draggable = true;
            marker.userData = { index: 1 };
            mapView.addMarker(marker);
        }
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
        providers: [wenturepoint_service_1.WenturePointService],
        templateUrl: "pages/map-page/map-page.html",
        styleUrls: ["pages/map-page/map-page-common.css", "pages/map-page/map-page.css"]
    }),
    __metadata("design:paramtypes", [router_1.Router, wenturepoint_service_1.WenturePointService, page_1.Page])
], MapPageComponent);
exports.MapPageComponent = MapPageComponent;
function startWatch(event) {
    var mapView = event.object;
    currentPosCircle = new mapsModule.Circle();
    currentPosCircle.center = mapsModule.Position.positionFromLatLng(0, 0);
    currentPosCircle.visible = true;
    currentPosCircle.radius = 20;
    currentPosCircle.fillColor = new color_1.Color('#6c9df0');
    currentPosCircle.strokeColor = new color_1.Color('#396abd');
    currentPosCircle.strokewidth = 2;
    currentPosCircle.clickable = true;
    mapView.addCircle(currentPosCircle);
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
            currentPosCircle.center = mapsModule.Position.positionFromLatLng(this.latitude, this.longitude);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBeUU7QUFDekUscUNBQTRDO0FBQzVDLDBFQUFzRTtBQUN0RSxzREFBd0Q7QUFDeEQsMENBQXlDO0FBQ3pDLGdDQUErQjtBQUMvQiwrQkFBOEI7QUFJOUIsdUZBQXFGO0FBQ3JGLG1FQUF3RDtBQUV4RCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUN6RCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDMUMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN0QyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFMUMsSUFBSSxPQUFZLENBQUM7QUFDakIsSUFBSSxlQUF5QixDQUFDO0FBQzlCLElBQUksZ0JBQXFCLENBQUM7QUFDMUIsSUFBSSxlQUF1QixDQUFDLENBQUMsdURBQXVEO0FBQ3BGLElBQUksT0FBWSxDQUFDO0FBQ2pCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBRTFCLGtDQUFlLENBQUMsU0FBUyxFQUFFLGNBQU0sT0FBQSxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxPQUFPLEVBQS9DLENBQStDLENBQUMsQ0FBQztBQVVsRixJQUFhLGdCQUFnQjtJQVczQiwwQkFBb0IsTUFBYyxFQUFVLG1CQUF3QyxFQUFVLElBQVU7UUFBeEcsaUJBRUM7UUFGbUIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFVLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFNO1FBSHhHLGtDQUFrQztRQUNsQyxNQUFDLEdBQVcsQ0FBQyxDQUFDO1FBc0VkLFlBQVk7UUFDWixlQUFVLEdBQUcsVUFBQyxL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RyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ0MsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNwQixDQUFDO0FBRUQ7SUFDRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQsNENBQTRDO0FBQzVDLGlCQUFpQixNQUFNO0lBQ3JCLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDbEIsT0FBTyxFQUFFLHVDQUF1QyxHQUFHLE1BQU07UUFDekQsWUFBWSxFQUFFLElBQUk7S0FDbkIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgaXNBbmRyb2lkLCBpc0lPUyB9IGZyb20gXCJwbGF0Zm9ybVwiO1xuaW1wb3J0IHtyZWdpc3RlckVsZW1lbnR9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9lbGVtZW50LXJlZ2lzdHJ5XCI7XG5pbXBvcnQgKiBhcyBnZW9sb2NhdGlvbiBmcm9tIFwibmF0aXZlc2NyaXB0LWdlb2xvY2F0aW9uXCI7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tIFwiQGFuZ3VsYXIvcm91dGVyXCI7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSBcInVpL3BhZ2VcIjtcbmltcG9ydCB7IENvbG9yIH0gZnJvbSBcImNvbG9yXCI7XG4vL2ltcG9ydCB7IEltYWdlIH0gZnJvbSBcInVpL2ltYWdlXCI7XG5pbXBvcnQgeyBJbWFnZVNvdXJjZSB9IGZyb20gXCJpbWFnZS1zb3VyY2VcIjtcbmltcG9ydCB7IFdlbnR1cmVQb2ludCB9IGZyb20gXCIuLi8uLi9zaGFyZWQvd2VudHVyZXBvaW50L3dlbnR1cmVwb2ludFwiO1xuaW1wb3J0IHsgV2VudHVyZVBvaW50U2VydmljZSB9IGZyb20gXCIuLi8uLi9zaGFyZWQvd2VudHVyZXBvaW50L3dlbnR1cmVwb2ludC5zZXJ2aWNlXCI7XG5pbXBvcnQgeyBUbnNTaWRlRHJhd2VyIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXNpZGVkcmF3ZXInO1xuXG52YXIgbWFwc01vZHVsZSA9IHJlcXVpcmUoXCJuYXRpdmVzY3JpcHQtZ29vZ2xlLW1hcHMtc2RrXCIpO1xudmFyIGRpYWxvZ3NNb2R1bGUgPSByZXF1aXJlKFwidWkvZGlhbG9nc1wiKTtcbnZhciBJbWFnZSA9IHJlcXVpcmUoXCJ1aS9pbWFnZVwiKS5JbWFnZTtcbnZhciBpbWFnZVNvdXJjZSA9IHJlcXVpcmUoXCJpbWFnZS1zb3VyY2VcIik7XG5cbnZhciB3YXRjaElkOiBhbnk7XG52YXIgY3VycmVudFBvc2l0aW9uOiBMb2NhdGlvbjtcbnZhciBjdXJyZW50UG9zQ2lyY2xlOiBhbnk7XG52YXIgY29sbGVjdERpc3RhbmNlOiBudW1iZXI7IC8vZGlzdGFuY2UgaW4gbSBvbiBob3cgY2xvc2UgdG8gZW5hYmxlIGNvbGxlY3QtcHJvcGVydHlcbnZhciBtYXBWaWV3OiBhbnk7XG52YXIgY29sbGVjdGVkTWFya2VycyA9IFtdO1xuXG5yZWdpc3RlckVsZW1lbnQoXCJNYXBWaWV3XCIsICgpID0+IHJlcXVpcmUoXCJuYXRpdmVzY3JpcHQtZ29vZ2xlLW1hcHMtc2RrXCIpLk1hcFZpZXcpO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6IFwibWFwLXBhZ2VcIixcbiAgcHJvdmlkZXJzOiBbV2VudHVyZVBvaW50U2VydmljZV0sXG4gIHRlbXBsYXRlVXJsOiBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmh0bWxcIixcbiAgc3R5bGVVcmxzOiBbXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS1jb21tb24uY3NzXCIsIFwicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UuY3NzXCJdXG59KVxuXG5cbmV4cG9ydCBjbGFzcyBNYXBQYWdlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQFZpZXdDaGlsZChcIk1hcFZpZXdcIikgbWFwVmlldzogRWxlbWVudFJlZjtcblxuICBsYXRpdHVkZTogbnVtYmVyO1xuICBsb25naXR1ZGU6IG51bWJlcjtcbiAgYWx0aXR1ZGU6IG51bWJlcjtcbiAgd2VudHVyZVBvaW50VGl0bGU6IHN0cmluZztcbiAgd2VudHVyZVBvaW50SW5mbzogc3RyaW5nO1xuICAvL2kgc3RvcmVzIHRoZSBpbmRleCB2YWx1ZSBvZiBtZW51XG4gIGk6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByb3V0ZXI6IFJvdXRlciwgcHJpdmF0ZSB3ZW50dXJlUG9pbnRTZXJ2aWNlOiBXZW50dXJlUG9pbnRTZXJ2aWNlLCBwcml2YXRlIHBhZ2U6IFBhZ2UpIHtcblxuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gVE9ETzogTG9hZGVyP1xuICAgIC8vIFRPRE86IG1lbnVpdGVtIGljb25pdCBwdXV0dHV1LCBhY3Rpb25iYXJpbiBtYWhkIHBpaWxvdHRhbWluZW4oPylcbiAgICBUbnNTaWRlRHJhd2VyLmJ1aWxkKHtcbiAgICAgIHRlbXBsYXRlczogW3tcbiAgICAgICAgICB0aXRsZTogJ1dlbnR1cmVwb2ludHMnLFxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19ob21lX3doaXRlXzI0ZHAnLFxuICAgICAgICAgIC8vaW9zSWNvbjogJ2ljX2hvbWVfd2hpdGUnLFxuICAgICAgfSwge1xuICAgICAgICAgIHRpdGxlOiAnUm91dGVzJyxcbiAgICAgICAgICAvL2FuZHJvaWRJY29uOiAnaWNfZ2F2ZWxfd2hpdGVfMjRkcCcsXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfZ2F2ZWxfd2hpdGUnLFxuICAgICAgfSwge1xuICAgICAgICAgIHRpdGxlOiAnTXkgV2VudHVyZXMnLFxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19hY2NvdW50X2JhbGFuY2Vfd2hpdGVfMjRkcCcsXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfYWNjb3VudF9iYWxhbmNlX3doaXRlJyxcbiAgICAgIH0sIHtcbiAgICAgICAgICB0aXRsZTogJ1NldHRpbmdzJyxcbiAgICAgICAgLy8gIGFuZHJvaWRJY29uOiAnaWNfYnVpbGRfd2hpdGVfMjRkcCcsXG4gICAgICAgIC8vICBpb3NJY29uOiAnaWNfYnVpbGRfd2hpdGUnLFxuICAgICAgfSwge1xuICAgICAgICAgIHRpdGxlOiAnTG9nIG91dCcsXG4gICAgICAgIC8vICBhbmRyb2lkSWNvbjogJ2ljX2FjY291bnRfY2lyY2xlX3doaXRlXzI0ZHAnLFxuICAgICAgICAvLyAgaW9zSWNvbjogJ2ljX2FjY291bnRfY2lyY2xlX3doaXRlJyxcbiAgICAgIH1dLFxuICAgICAgdGl0bGU6ICdXZW50dXJlJyxcbiAgICAgIHN1YnRpdGxlOiAneW91ciB1cmJhbiBhZHZlbnR1cmUhJyxcbiAgICAgIGxpc3RlbmVyOiAoaW5kZXgpID0+IHtcbiAgICAgICAgICB0aGlzLmkgPSBpbmRleFxuICAgICAgfSxcbiAgICAgIGNvbnRleHQ6IHRoaXMsXG4gICAgfSk7XG5cbiAgfVxuXG4gIHRvZ2dsZVNpZGVEcmF3ZXIoKSB7XG4gICAgVG5zU2lkZURyYXdlci50b2dnbGUoKTtcbiAgfVxuXG4gIGNvbGxlY3RCdXR0b25UYXBwZWQoKSB7XG4gICAgLy8gVE9ETzogVMOkaMOkbiBzZSBrZXLDpHlzdG9pbWludG8sIGlmIGRpc3RhbmNlIGp0biwgbmlpbiB0dW9sdGEgdG9pIGNvbGxlY3QoKVxuICAgIGFsZXJ0KFwiTm90IHlldCBpbXBsZW1lbnRlZC5cIik7XG4gIH1cblxuICBhZGRXZW50dXJlUG9pbnRzKG1hcFZpZXcpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHdQb2ludCA9IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpO1xuICAgICAgdmFyIG1hcmtlciA9IG5ldyBtYXBzTW9kdWxlLk1hcmtlcigpO1xuXG4gICAgICBtYXJrZXIucG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyh3UG9pbnQubGF0LCB3UG9pbnQubG5nKTtcbiAgICAgIG1hcmtlci50aXRsZSA9IHdQb2ludC50aXRsZTtcbiAgICAgIG1hcmtlci5zbmlwcGV0ID0gXCJcIjtcbiAgICAgIC8vQW5kcm9pZGlsbGEgdG9pbWlpLiBJb3NpbGxlIHBpdMOkw6Qga2F0c29hIG1pdGVuIHJlc291cmNlIHRvaW1paS4gUEM6bGzDpCBlaSBweXN0eXTDpCB0ZXN0YWFtYWFuXG4gICAgICAvL0lrb25pYSBqb3V0dXUgaGllbW5hIG11b2trYWFtYWFuKHBpZW5lbW3DpGtzaSBqYSBsaXPDpHTDpMOkbiBwaWVuaSBvc29pdGluIGFsYWxhaXRhYW4pXG4gICAgICB2YXIgaWNvbiA9IG5ldyBJbWFnZSgpO1xuICAgICAgaWNvbi5pbWFnZVNvdXJjZSA9IGltYWdlU291cmNlLmZyb21SZXNvdXJjZSgnaWNvbicpO1xuICAgICAgbWFya2VyLmljb24gPSBpY29uO1xuICAgICAgbWFya2VyLmRyYWdnYWJsZSA9IHRydWU7XG4gICAgICBtYXJrZXIudXNlckRhdGEgPSB7aW5kZXg6IDF9O1xuICAgICAgbWFwVmlldy5hZGRNYXJrZXIobWFya2VyKTtcblxuICAgIH1cbiAgfVxuXG4gIC8vTWFwIGV2ZW50c1xuICBvbk1hcFJlYWR5ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXAgUmVhZHlcIik7XG4gICAgc3RhcnRXYXRjaChldmVudCk7XG5cbiAgICAvLyBDaGVjayBpZiBsb2NhdGlvbiBzZXJ2aWNlcyBhcmUgZW5hYmxlZFxuICAgIGlmICghZ2VvbG9jYXRpb24uaXNFbmFibGVkKCkpIHtcbiAgICAgICAgZ2VvbG9jYXRpb24uZW5hYmxlTG9jYXRpb25SZXF1ZXN0KCk7XG4gICAgfSBlbHNlIGNvbnNvbGUubG9nKFwiQWxsZXMgaW4gT3JkbnVuZ1wiKTtcblxuICAgIHZhciBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xuICAgIHZhciBnTWFwID0gbWFwVmlldy5nTWFwO1xuXG4gICAgdGhpcy5hZGRXZW50dXJlUG9pbnRzKG1hcFZpZXcpO1xuXG4gIH07XG5cbiAgb25Db29yZGluYXRlTG9uZ1ByZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJMb25nUHJlc3NcIik7XG5cbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgICB2YXIgbGF0ID0gZXZlbnQucG9zaXRpb24ubGF0aXR1ZGU7XG4gICAgdmFyIGxuZyA9IGV2ZW50LnBvc2l0aW9uLmxvbmdpdHVkZTtcblxuICAgIGNvbnNvbGUubG9nKFwiVGFwcGVkIGxvY2F0aW9uOiBcXG5cXHRMYXRpdHVkZTogXCIgKyBldmVudC5wb3NpdGlvbi5sYXRpdHVkZSArXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuXFx0TG9uZ2l0dWRlOiBcIiArIGV2ZW50LnBvc2l0aW9uLmxvbmdpdHVkZSk7XG5cbi8qICBUw6R0w6Qgdm9pIGvDpHl0dMOkw6QgdGVzdGFpbHV1biwgam9zIGhhbHVhYSBsaXPDpHTDpCBtYXJrZXJlaXRhLlxuICAgIHZhciBtYXJrZXIgPSBuZXcgbWFwc01vZHVsZS5NYXJrZXIoKTtcbiAgICBtYXJrZXIucG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyhsYXQsIGxuZyk7XG4gICAgbWFya2VyLnRpdGxlID0gXCJXZW50dXJlIHBvaW50XCI7XG4gICAgbWFya2VyLnNuaXBwZXQgPSBcIlwiO1xuICAgIC8vQW5kcm9pZGlsbGEgdG9pbWlpLiBJb3NpbGxlIHBpdMOkw6Qga2F0c29hIG1pdGVuIHJlc291cmNlIHRvaW1paS4gUEM6bGzDpCBlaSBweXN0eXTDpCB0ZXN0YWFtYWFuXG4gICAgLy9Ja29uaWEgam91dHV1IGhpZW1uYSBtdW9ra2FhbWFhbiBwaWVuZW1tw6Rrc2kgamEgbGlzw6R0w6TDpG4gcGllbmkgb3NvaXRpbiBhbGFsYWl0YWFuKVxuICAgIHZhciBpY29uID0gbmV3IEltYWdlKCk7XG4gICAgaWNvbi5pbWFnZVNvdXJjZSA9IGltYWdlU291cmNlLmZyb21SZXNvdXJjZSgnaWNvbicpO1xuICAgIG1hcmtlci5pY29uID0gaWNvbjtcbiAgICBtYXJrZXIuZHJhZ2dhYmxlID0gdHJ1ZTtcbiAgICBtYXJrZXIudXNlckRhdGEgPSB7aW5kZXg6IDF9O1xuICAgIG1hcFZpZXcuYWRkTWFya2VyKG1hcmtlcik7XG4gICovXG4gIH07XG5cbiAgLy8gVE9ETzogVMOkbcOkbiB2b2lzaSBzaWlydMOkw6Qgam9ob25raW4gZmlrc3VtcGFhbiBwYWlra2Fhbi5cbiAgVG5zU2lkZURyYXdlck9wdGlvbnNMaXN0ZW5lciA9IChpbmRleCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGluZGV4KVxuICB9O1xuXG4gIG9uTWFya2VyU2VsZWN0ID0gKGV2ZW50KSA9PiB7XG5cbiAgICBpbnRlcmZhY2UgUG9zaXRpb25PYmplY3Qge1xuICAgICAgXCJsYXRpdHVkZVwiOiBzdHJpbmcsXG4gICAgICBcImxvbmdpdHVkZVwiOiBzdHJpbmdcbiAgICB9XG5cbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcblxuICAgIGxldCBtYXJrZXJQb3MgPSBKU09OLnN0cmluZ2lmeShldmVudC5tYXJrZXIucG9zaXRpb24pO1xuICAgIGxldCBjdXJyZW50UG9zID0gSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKTtcbiAgICBsZXQgZGlzdGFuY2UgPSBnZXREaXN0YW5jZVRvKGV2ZW50Lm1hcmtlcik7XG5cbiAgICAvLyBDaGFuZ2UgdGhlIGNvbnRlbnQgb2YgdGhlIGJvdHRvbSBiYXIgdGV4dFxuICAgIHRoaXMud2VudHVyZVBvaW50VGl0bGUgPSBldmVudC5tYXJrZXIudGl0bGU7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGV2ZW50Lm1hcmtlci50aXRsZSA9PT0gdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSkudGl0bGUpIHtcbiAgICAgICAgdGhpcy53ZW50dXJlUG9pbnRJbmZvID0gdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSkuaW5mbztcbiAgICAgICAgY29uc29sZS5sb2coXCJcXHRcIiArIHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpLmluZm8pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGV2ZW50Lm1hcmtlci5zbmlwcGV0ID0gXCJEaXN0YW5jZTogXCIgKyBkaXN0YW5jZS50b0ZpeGVkKDApICsgXCIgbVwiO1xuXG4gICAgY29uc29sZS5sb2coXCJcXG5cXHRNYXJrZXJTZWxlY3Q6IFwiICsgZXZlbnQubWFya2VyLnRpdGxlXG4gICAgICAgICAgICAgICAgICArIFwiXFxuXFx0TWFya2VyIHBvc2l0aW9uOiBcIiArIG1hcmtlclBvc1xuICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdEN1cnJlbnQgcG9zaXRpb246IFwiICsgY3VycmVudFBvc1xuICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdERpc3RhbmNlIHRvIG1hcmtlcjogXCIgKyBkaXN0YW5jZS50b0ZpeGVkKDIpICsgXCJtXCIpO1xuXG4gICAgLy8gVGhpcyBtaWdodCBiZSBzdHVwaWQsIGJ1dCB3b3JrcyBmb3Igbm93IDopXG4gICAgLy9UT0RPOiBhZGRpbmcgY29sbGVjdGVkIG1hcmtlciB0byBhIGxpc3QgZXRjLiBiNCByZW1vdmluZ1xuICAgIGZ1bmN0aW9uIGNvbGxlY3RNYXJrZXIobWFyaykge1xuICAgICAgY29sbGVjdERpc3RhbmNlID0gNTA7XG4gICAgICBpZihnZXREaXN0YW5jZVRvKG1hcmspIDwgY29sbGVjdERpc3RhbmNlKSB7XG4gICAgICAgIGxldCBhbW91bnQgPSBob3dNYW55Q29sbGVjdGVkKCk7XG4gICAgICAgIGNvbGxlY3QoYW1vdW50KTtcbiAgICAgICAgLy9hbGVydChcIlZlbnR1cmUgcG9pbnQgY29sbGVjdGVkLiBcXG5Db2xsZWN0ZWQ6IFwiICsgYW1vdW50KTtcbiAgICAgICAgY29sbGVjdGVkTWFya2Vycy5wdXNoKG1hcmspO1xuICAgICAgICBtYXBWaWV3LnJlbW92ZU1hcmtlcihtYXJrKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJZb3UgaGF2ZSBcIiArIGNvbGxlY3RlZE1hcmtlcnMubGVuZ3RoICsgXCIgY29sbGVjdGVkIG1hcmtlcnMuXCIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlxcbk1hcmtlciB0b28gZmFyIGF3YXksIG1vdmUgY2xvc2VyLlwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb2xsZWN0TWFya2VyKGV2ZW50Lm1hcmtlcik7XG5cbiAgfTtcblxuICBvbk1hcmtlckJlZ2luRHJhZ2dpbmcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckJlZ2luRHJhZ2dpbmdcIik7XG4gIH07XG5cbiAgb25NYXJrZXJFbmREcmFnZ2luZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyRW5kRHJhZ2dpbmdcIik7XG4gIH07XG5cbiAgb25NYXJrZXJEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJEcmFnXCIpO1xuICB9O1xuXG4gIG9uQ2FtZXJhQ2hhbmdlZCA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiQ2FtZXJhQ2hhbmdlXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiV2VudHVyZSBQb2ludHM6XCIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIlxcdFwiICsgSlNPTi5zdHJpbmdpZnkodGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSkpKTtcbiAgICB9XG4gIH07XG5cbiAgb25TaGFwZVNlbGVjdCA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiWW91ciBjdXJyZW50IHBvc2l0aW9uIGlzOiBcIiArIEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbikpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRXYXRjaChldmVudCkge1xuXG4gIGludGVyZmFjZSBMb2NhdGlvbk9iamVjdCB7XG4gICAgXCJsYXRpdHVkZVwiOiBudW1iZXIsXG4gICAgXCJsb25naXR1ZGVcIjogbnVtYmVyLFxuICAgIFwiYWx0aXR1ZGVcIjogbnVtYmVyLFxuICAgIFwiaG9yaXpvbnRhbEFjY3VyYWN5XCI6IG51bWJlcixcbiAgICBcInZlcnRpY2FsQWNjdXJhY3lcIjogbnVtYmVyLFxuICAgIFwic3BlZWRcIjogbnVtYmVyLFxuICAgIFwiZGlyZWN0aW9uXCI6IG51bWJlcixcbiAgICBcInRpbWVzdGFtcFwiOnN0cmluZ1xuICB9XG5cbiAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG4gIGN1cnJlbnRQb3NDaXJjbGUgPSBuZXcgbWFwc01vZHVsZS5DaXJjbGUoKTtcbiAgY3VycmVudFBvc0NpcmNsZS5jZW50ZXIgPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZygwLCAwKTtcbiAgY3VycmVudFBvc0NpcmNsZS52aXNpYmxlID0gdHJ1ZTtcbiAgY3VycmVudFBvc0NpcmNsZS5yYWRpdXMgPSAyMDtcbiAgY3VycmVudFBvc0NpcmNsZS5maWxsQ29sb3IgPSBuZXcgQ29sb3IoJyM2YzlkZjAnKTtcbiAgY3VycmVudFBvc0NpcmNsZS5zdHJva2VDb2xvciA9IG5ldyBDb2xvcignIzM5NmFiZCcpO1xuICBjdXJyZW50UG9zQ2lyY2xlLnN0cm9rZXdpZHRoID0gMjtcbiAgY3VycmVudFBvc0NpcmNsZS5jbGlja2FibGUgPSB0cnVlO1xuICBtYXBWaWV3LmFkZENpcmNsZShjdXJyZW50UG9zQ2lyY2xlKTtcblxuICB3YXRjaElkID0gZ2VvbG9jYXRpb24ud2F0Y2hMb2NhdGlvbihcbiAgZnVuY3Rpb24gKGxvYykge1xuICAgICAgaWYgKGxvYykge1xuICAgICAgICAgIGxldCBvYmo6IExvY2F0aW9uT2JqZWN0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShsb2MpKTtcbiAgICAgICAgICB0aGlzLmxhdGl0dWRlID0gb2JqLmxhdGl0dWRlO1xuICAgICAgICAgIHRoaXMubG9uZ2l0dWRlID0gb2JqLmxvbmdpdHVkZTtcbiAgICAgICAgICB0aGlzLmFsdGl0dWRlID0gb2JqLmFsdGl0dWRlO1xuICAgICAgICAgIC8qdmFyKi9jdXJyZW50UG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyhvYmoubGF0aXR1ZGUsIG9iai5sb25naXR1ZGUpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKG5ldyBEYXRlKCkgKyBcIlxcblJlY2VpdmVkIGxvY2F0aW9uOlxcblxcdExhdGl0dWRlOiBcIiArIG9iai5sYXRpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdExvbmdpdHVkZTogXCIgKyBvYmoubG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0QWx0aXR1ZGU6IFwiICsgb2JqLmFsdGl0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0VGltZXN0YW1wOiBcIiArIG9iai50aW1lc3RhbXBcbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHREaXJlY3Rpb246IFwiICsgb2JqLmRpcmVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcbkN1cnJlbnRQb3M6IFwiICsgSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKSk7XG5cbiAgICAgICAgICBjdXJyZW50UG9zQ2lyY2xlLmNlbnRlciA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKHRoaXMubGF0aXR1ZGUsIHRoaXMubG9uZ2l0dWRlKTtcblxuICAgICAgICAgIG1hcFZpZXcubGF0aXR1ZGUgPSB0aGlzLmxhdGl0dWRlO1xuICAgICAgICAgIG1hcFZpZXcubG9uZ2l0dWRlID0gdGhpcy5sb25naXR1ZGU7XG4gICAgICB9XG4gIH0sXG4gIGZ1bmN0aW9uKGUpe1xuICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBlLm1lc3NhZ2UpO1xuICB9LFxuICB7ZGVzaXJlZEFjY3VyYWN5OiAzLCB1cGRhdGVEaXN0YW5jZTogMTAsIG1pbmltdW1VcGRhdGVUaW1lIDogMTAwMCAqIDJ9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZFdhdGNoKCkge1xuICAgIGlmICh3YXRjaElkKSB7XG4gICAgICAgIGdlb2xvY2F0aW9uLmNsZWFyV2F0Y2god2F0Y2hJZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTXkgd2F0Y2ggaXMgZW5kZWQuLi4gVC4gSm9uIFNub3dcIik7XG4gICAgfVxufVxuXG4vLyBUT0RPOiB0b2ltaW1hYW4gYW5kcm9pZGlsbGUga2Fuc3NhXG5mdW5jdGlvbiBnZXREaXN0YW5jZVRvKG9iaikge1xuICBsZXQgb2JqUG9zID0gSlNPTi5zdHJpbmdpZnkob2JqLnBvc2l0aW9uKTtcbiAgbGV0IGN1cnJlbnRQb3MgPSBKU09OLnN0cmluZ2lmeShjdXJyZW50UG9zaXRpb24pO1xuICBsZXQgZGlzdGFuY2UgPSBudWxsO1xuXG4gIGlmKGlzSU9TKSB7XG4gICAgLy9jb25zb2xlLmxvZyhcIlJ1bm5pbmcgb24gaW9zLlwiKVxuICAgIGRpc3RhbmNlID0gZ2VvbG9jYXRpb24uZGlzdGFuY2UoSlNPTi5wYXJzZShvYmpQb3MpLl9pb3MsIEpTT04ucGFyc2UoY3VycmVudFBvcykuX2lvcyk7XG4gIH0gZWxzZSBpZihpc0FuZHJvaWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIlJ1bm5pbmcgb24gYW5kcm9pZC5cIik7XG4gICAgZGlzdGFuY2UgPSAzOy8vZ2VvbG9jYXRpb24uZGlzdGFuY2UoSlNPTi5wYXJzZShvYmpQb3MpLl9hbmRyb2lkLCBKU09OLnBhcnNlKGN1cnJlbnRQb3MpLl9hbmRyb2lkKTtcbiAgfSBlbHNlIHtcbiAgICBkaXN0YW5jZSA9IFwiZXJyb3JcIjtcbiAgICBjb25zb2xlLmxvZyhcIkNvdWxkIG5vdCBmaW5kIGRpc3RhbmNlLlwiKTtcbiAgfVxuICAgIHJldHVybiBkaXN0YW5jZTtcbn1cblxuZnVuY3Rpb24gaG93TWFueUNvbGxlY3RlZCgpIHtcbiAgcmV0dXJuIGNvbGxlY3RlZE1hcmtlcnMubGVuZ3RoICsgMTtcbn1cblxuLy9oYW5kbGVzIHRoZSBjb2xsZWN0aW9uIGFuZCByZXR1cm5zIG1lc3NhZ2VcbmZ1bmN0aW9uIGNvbGxlY3QoYW1vdW50KSB7XG4gIGRpYWxvZ3NNb2R1bGUuYWxlcnQoe1xuICAgIG1lc3NhZ2U6IFwiV2VudHVyZSBwb2ludCBjb2xsZWN0ZWQhIFxcbllvdSBoYXZlOiBcIiArIGFtb3VudCxcbiAgICBva0J1dHRvblRleHQ6IFwiT0tcIlxuICB9KTtcbn1cbiJdfQ==