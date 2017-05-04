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
        this.onCoordinateTapped = function (event) {
            var mapView = event.object;
            _this.wenturePointTitle = "";
            _this.wenturePointInfo = "";
            console.log("Coordinate tapped.");
            _this.markerIsSelected = false;
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
            // Make bottom bar visible
            _this.markerIsSelected = true;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBeUU7QUFDekUscUNBQTRDO0FBQzVDLDBFQUFzRTtBQUN0RSxzREFBd0Q7QUFDeEQsMENBQXlDO0FBQ3pDLGdDQUErQjtBQUMvQiwrQkFBOEI7QUFJOUIsdUZBQXFGO0FBQ3JGLG1FQUF3RDtBQUV4RCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUN6RCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDMUMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN0QyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFMUMsSUFBSSxPQUFZLENBQUM7QUFDakIsSUFBSSxlQUF5QixDQUFDO0FBQzlCLElBQUksZ0JBQXFCLENBQUM7QUFDMUIsSUFBSSxlQUF1QixDQUFDLENBQUMsdURBQXVEO0FBQ3BGLElBQUksT0FBWSxDQUFDO0FBQ2pCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBRTFCLGtDQUFlLENBQUMsU0FBUyxFQUFFLGNBQU0sT0FBQSxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxPQUFPLEVBQS9DLENBQStDLENBQUMsQ0FBQztBQVVsRixJQUFhLGdCQUFnQjtJQVczQiwwQkFBb0IsTUFBYyxFQUFVLG1CQUF3QyxFQUFVLElBQVU7UUFBeEcsaUJBRUM7UUFGbUIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFVLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFNO1FBSHhHLGtDQUFrQztRQUNsQyxNQUFDLEdBQVcsQ0FBQyxDQUFDO1FBc0VkLFlBQVk7UUFDWixlQUFVLEdBQUcsVUFBQyxL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LEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQSxDQUFDLG9CQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNuQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUEscUZBQXFGO0lBQ3BHLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFDQyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFFRDtJQUNFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFFRCw0Q0FBNEM7QUFDNUMsaUJBQWlCLE1BQU07SUFDckIsYUFBYSxDQUFDLEtBQUssQ0FBQztRQUNsQixPQUFPLEVBQUUsdUNBQXVDLEdBQUcsTUFBTTtRQUN6RCxZQUFZLEVBQUUsSUFBSTtLQUNuQixDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBPbkluaXQsIFZpZXdDaGlsZCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IGlzQW5kcm9pZCwgaXNJT1MgfSBmcm9tIFwicGxhdGZvcm1cIjtcclxuaW1wb3J0IHtyZWdpc3RlckVsZW1lbnR9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9lbGVtZW50LXJlZ2lzdHJ5XCI7XHJcbmltcG9ydCAqIGFzIGdlb2xvY2F0aW9uIGZyb20gXCJuYXRpdmVzY3JpcHQtZ2VvbG9jYXRpb25cIjtcclxuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xyXG5pbXBvcnQgeyBQYWdlIH0gZnJvbSBcInVpL3BhZ2VcIjtcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tIFwiY29sb3JcIjtcclxuLy9pbXBvcnQgeyBJbWFnZSB9IGZyb20gXCJ1aS9pbWFnZVwiO1xyXG5pbXBvcnQgeyBJbWFnZVNvdXJjZSB9IGZyb20gXCJpbWFnZS1zb3VyY2VcIjtcclxuaW1wb3J0IHsgV2VudHVyZVBvaW50IH0gZnJvbSBcIi4uLy4uL3NoYXJlZC93ZW50dXJlcG9pbnQvd2VudHVyZXBvaW50XCI7XHJcbmltcG9ydCB7IFdlbnR1cmVQb2ludFNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3dlbnR1cmVwb2ludC93ZW50dXJlcG9pbnQuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBUbnNTaWRlRHJhd2VyIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXNpZGVkcmF3ZXInO1xyXG5cclxudmFyIG1hcHNNb2R1bGUgPSByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKTtcclxudmFyIGRpYWxvZ3NNb2R1bGUgPSByZXF1aXJlKFwidWkvZGlhbG9nc1wiKTtcclxudmFyIEltYWdlID0gcmVxdWlyZShcInVpL2ltYWdlXCIpLkltYWdlO1xyXG52YXIgaW1hZ2VTb3VyY2UgPSByZXF1aXJlKFwiaW1hZ2Utc291cmNlXCIpO1xyXG5cclxudmFyIHdhdGNoSWQ6IGFueTtcclxudmFyIGN1cnJlbnRQb3NpdGlvbjogTG9jYXRpb247XHJcbnZhciBjdXJyZW50UG9zQ2lyY2xlOiBhbnk7XHJcbnZhciBjb2xsZWN0RGlzdGFuY2U6IG51bWJlcjsgLy9kaXN0YW5jZSBpbiBtIG9uIGhvdyBjbG9zZSB0byBlbmFibGUgY29sbGVjdC1wcm9wZXJ0eVxyXG52YXIgbWFwVmlldzogYW55O1xyXG52YXIgY29sbGVjdGVkTWFya2VycyA9IFtdO1xyXG5cclxucmVnaXN0ZXJFbGVtZW50KFwiTWFwVmlld1wiLCAoKSA9PiByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKS5NYXBWaWV3KTtcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiBcIm1hcC1wYWdlXCIsXHJcbiAgcHJvdmlkZXJzOiBbV2VudHVyZVBvaW50U2VydmljZV0sXHJcbiAgdGVtcGxhdGVVcmw6IFwicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UuaHRtbFwiLFxyXG4gIHN0eWxlVXJsczogW1wicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UtY29tbW9uLmNzc1wiLCBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmNzc1wiXVxyXG59KVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBNYXBQYWdlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcclxuICBAVmlld0NoaWxkKFwiTWFwVmlld1wiKSBtYXBWaWV3OiBFbGVtZW50UmVmO1xyXG5cclxuICBsYXRpdHVkZTogbnVtYmVyO1xyXG4gIGxvbmdpdHVkZTogbnVtYmVyO1xyXG4gIGFsdGl0dWRlOiBudW1iZXI7XHJcbiAgd2VudHVyZVBvaW50VGl0bGU6IHN0cmluZztcclxuICB3ZW50dXJlUG9pbnRJbmZvOiBzdHJpbmc7XHJcbiAgLy9pIHN0b3JlcyB0aGUgaW5kZXggdmFsdWUgb2YgbWVudVxyXG4gIGk6IG51bWJlciA9IDA7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsIHByaXZhdGUgd2VudHVyZVBvaW50U2VydmljZTogV2VudHVyZVBvaW50U2VydmljZSwgcHJpdmF0ZSBwYWdlOiBQYWdlKSB7XHJcblxyXG4gIH1cclxuXHJcbiAgbmdPbkluaXQoKSB7XHJcbiAgICAvLyBUT0RPOiBMb2FkZXI/XHJcbiAgICAvLyBUT0RPOiBtZW51aXRlbSBpY29uaXQgcHV1dHR1dSwgYWN0aW9uYmFyaW4gbWFoZCBwaWlsb3R0YW1pbmVuKD8pXHJcbiAgICBUbnNTaWRlRHJhd2VyLmJ1aWxkKHtcclxuICAgICAgdGVtcGxhdGVzOiBbe1xyXG4gICAgICAgICAgdGl0bGU6ICdXZW50dXJlcG9pbnRzJyxcclxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19ob21lX3doaXRlXzI0ZHAnLFxyXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfaG9tZV93aGl0ZScsXHJcbiAgICAgIH0sIHtcclxuICAgICAgICAgIHRpdGxlOiAnUm91dGVzJyxcclxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19nYXZlbF93aGl0ZV8yNGRwJyxcclxuICAgICAgICAgIC8vaW9zSWNvbjogJ2ljX2dhdmVsX3doaXRlJyxcclxuICAgICAgfSwge1xyXG4gICAgICAgICAgdGl0bGU6ICdNeSBXZW50dXJlcycsXHJcbiAgICAgICAgICAvL2FuZHJvaWRJY29uOiAnaWNfYWNjb3VudF9iYWxhbmNlX3doaXRlXzI0ZHAnLFxyXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfYWNjb3VudF9iYWxhbmNlX3doaXRlJyxcclxuICAgICAgfSwge1xyXG4gICAgICAgICAgdGl0bGU6ICdTZXR0aW5ncycsXHJcbiAgICAgICAgLy8gIGFuZHJvaWRJY29uOiAnaWNfYnVpbGRfd2hpdGVfMjRkcCcsXHJcbiAgICAgICAgLy8gIGlvc0ljb246ICdpY19idWlsZF93aGl0ZScsXHJcbiAgICAgIH0sIHtcclxuICAgICAgICAgIHRpdGxlOiAnTG9nIG91dCcsXHJcbiAgICAgICAgLy8gIGFuZHJvaWRJY29uOiAnaWNfYWNjb3VudF9jaXJjbGVfd2hpdGVfMjRkcCcsXHJcbiAgICAgICAgLy8gIGlvc0ljb246ICdpY19hY2NvdW50X2NpcmNsZV93aGl0ZScsXHJcbiAgICAgIH1dLFxyXG4gICAgICB0aXRsZTogJ1dlbnR1cmUnLFxyXG4gICAgICBzdWJ0aXRsZTogJ3lvdXIgdXJiYW4gYWR2ZW50dXJlIScsXHJcbiAgICAgIGxpc3RlbmVyOiAoaW5kZXgpID0+IHtcclxuICAgICAgICAgIHRoaXMuaSA9IGluZGV4XHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbnRleHQ6IHRoaXMsXHJcbiAgICB9KTtcclxuXHJcbiAgfVxyXG5cclxuICB0b2dnbGVTaWRlRHJhd2VyKCkge1xyXG4gICAgVG5zU2lkZURyYXdlci50b2dnbGUoKTtcclxuICB9XHJcblxyXG4gIGNvbGxlY3RCdXR0b25UYXBwZWQoKSB7XHJcbiAgICAvLyBUT0RPOiBUw6Row6RuIHNlIGtlcsOkeXN0b2ltaW50bywgaWYgZGlzdGFuY2UganRuLCBuaWluIHR1b2x0YSB0b2kgY29sbGVjdCgpXHJcbiAgICBhbGVydChcIk5vdCB5ZXQgaW1wbGVtZW50ZWQuXCIpO1xyXG4gIH1cclxuXHJcbiAgYWRkV2VudHVyZVBvaW50cyhtYXBWaWV3KSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgd1BvaW50ID0gdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSk7XHJcbiAgICAgIHZhciBtYXJrZXIgPSBuZXcgbWFwc01vZHVsZS5NYXJrZXIoKTtcclxuXHJcbiAgICAgIG1hcmtlci5wb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKHdQb2ludC5sYXQsIHdQb2ludC5sbmcpO1xyXG4gICAgICBtYXJrZXIudGl0bGUgPSB3UG9pbnQudGl0bGU7XHJcbiAgICAgIG1hcmtlci5zbmlwcGV0ID0gXCJcIjtcclxuICAgICAgLy9BbmRyb2lkaWxsYSB0b2ltaWkuIElvc2lsbGUgcGl0w6TDpCBrYXRzb2EgbWl0ZW4gcmVzb3VyY2UgdG9pbWlpLiBQQzpsbMOkIGVpIHB5c3R5dMOkIHRlc3RhYW1hYW5cclxuICAgICAgLy9Ja29uaWEgam91dHV1IGhpZW1uYSBtdW9ra2FhbWFhbihwaWVuZW1tw6Rrc2kgamEgbGlzw6R0w6TDpG4gcGllbmkgb3NvaXRpbiBhbGFsYWl0YWFuKVxyXG4gICAgICB2YXIgaWNvbiA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICBpY29uLmltYWdlU291cmNlID0gaW1hZ2VTb3VyY2UuZnJvbVJlc291cmNlKCdpY29uJyk7XHJcbiAgICAgIG1hcmtlci5pY29uID0gaWNvbjtcclxuICAgICAgbWFya2VyLmRyYWdnYWJsZSA9IHRydWU7XHJcbiAgICAgIG1hcmtlci51c2VyRGF0YSA9IHtpbmRleDogMX07XHJcbiAgICAgIG1hcFZpZXcuYWRkTWFya2VyKG1hcmtlcik7XHJcblxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy9NYXAgZXZlbnRzXHJcbiAgb25NYXBSZWFkeSA9IChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coXCJNYXAgUmVhZHlcIik7XHJcbiAgICBzdGFydFdhdGNoKGV2ZW50KTtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBsb2NhdGlvbiBzZXJ2aWNlcyBhcmUgZW5hYmxlZFxyXG4gICAgaWYgKCFnZW9sb2NhdGlvbi5pc0VuYWJsZWQoKSkge1xyXG4gICAgICAgIGdlb2xvY2F0aW9uLmVuYWJsZUxvY2F0aW9uUmVxdWVzdCgpO1xyXG4gICAgfSBlbHNlIGNvbnNvbGUubG9nKFwiQWxsZXMgaW4gT3JkbnVuZ1wiKTtcclxuXHJcbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcclxuICAgIHZhciBnTWFwID0gbWFwVmlldy5nTWFwO1xyXG5cclxuICAgIHRoaXMuYWRkV2VudHVyZVBvaW50cyhtYXBWaWV3KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgb25Db29yZGluYXRlVGFwcGVkID0gKGV2ZW50KSA9PiB7XHJcbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcclxuICAgIHRoaXMud2VudHVyZVBvaW50VGl0bGUgPSBcIlwiO1xyXG4gICAgdGhpcy53ZW50dXJlUG9pbnRJbmZvID0gXCJcIjtcclxuICAgIGNvbnNvbGUubG9nKFwiQ29vcmRpbmF0ZSB0YXBwZWQuXCIpO1xyXG4gIH07XHJcblxyXG4gIG9uQ29vcmRpbmF0ZUxvbmdQcmVzcyA9IChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coXCJMb25nUHJlc3NcIik7XHJcblxyXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XHJcbiAgICB2YXIgbGF0ID0gZXZlbnQucG9zaXRpb24ubGF0aXR1ZGU7XHJcbiAgICB2YXIgbG5nID0gZXZlbnQucG9zaXRpb24ubG9uZ2l0dWRlO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiVGFwcGVkIGxvY2F0aW9uOiBcXG5cXHRMYXRpdHVkZTogXCIgKyBldmVudC5wb3NpdGlvbi5sYXRpdHVkZSArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG5cXHRMb25naXR1ZGU6IFwiICsgZXZlbnQucG9zaXRpb24ubG9uZ2l0dWRlKTtcclxuXHJcbi8qICBUw6R0w6Qgdm9pIGvDpHl0dMOkw6QgdGVzdGFpbHV1biwgam9zIGhhbHVhYSBsaXPDpHTDpCBtYXJrZXJlaXRhLlxyXG4gICAgdmFyIG1hcmtlciA9IG5ldyBtYXBzTW9kdWxlLk1hcmtlcigpO1xyXG4gICAgbWFya2VyLnBvc2l0aW9uID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcobGF0LCBsbmcpO1xyXG4gICAgbWFya2VyLnRpdGxlID0gXCJXZW50dXJlIHBvaW50XCI7XHJcbiAgICBtYXJrZXIuc25pcHBldCA9IFwiXCI7XHJcbiAgICAvL0FuZHJvaWRpbGxhIHRvaW1paS4gSW9zaWxsZSBwaXTDpMOkIGthdHNvYSBtaXRlbiByZXNvdXJjZSB0b2ltaWkuIFBDOmxsw6QgZWkgcHlzdHl0w6QgdGVzdGFhbWFhblxyXG4gICAgLy9Ja29uaWEgam91dHV1IGhpZW1uYSBtdW9ra2FhbWFhbiBwaWVuZW1tw6Rrc2kgamEgbGlzw6R0w6TDpG4gcGllbmkgb3NvaXRpbiBhbGFsYWl0YWFuKVxyXG4gICAgdmFyIGljb24gPSBuZXcgSW1hZ2UoKTtcclxuICAgIGljb24uaW1hZ2VTb3VyY2UgPSBpbWFnZVNvdXJjZS5mcm9tUmVzb3VyY2UoJ2ljb24nKTtcclxuICAgIG1hcmtlci5pY29uID0gaWNvbjtcclxuICAgIG1hcmtlci5kcmFnZ2FibGUgPSB0cnVlO1xyXG4gICAgbWFya2VyLnVzZXJEYXRhID0ge2luZGV4OiAxfTtcclxuICAgIG1hcFZpZXcuYWRkTWFya2VyKG1hcmtlcik7XHJcbiAgKi9cclxuICB9O1xyXG5cclxuICAvLyBUT0RPOiBUw6Rtw6RuIHZvaXNpIHNpaXJ0w6TDpCBqb2hvbmtpbiBmaWtzdW1wYWFuIHBhaWtrYWFuLlxyXG4gIFRuc1NpZGVEcmF3ZXJPcHRpb25zTGlzdGVuZXIgPSAoaW5kZXgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKGluZGV4KVxyXG4gIH07XHJcblxyXG4gIG9uTWFya2VyU2VsZWN0ID0gKGV2ZW50KSA9PiB7XHJcblxyXG4gICAgaW50ZXJmYWNlIFBvc2l0aW9uT2JqZWN0IHtcclxuICAgICAgXCJsYXRpdHVkZVwiOiBzdHJpbmcsXHJcbiAgICAgIFwibG9uZ2l0dWRlXCI6IHN0cmluZ1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xyXG5cclxuICAgIGxldCBtYXJrZXJQb3MgPSBKU09OLnN0cmluZ2lmeShldmVudC5tYXJrZXIucG9zaXRpb24pO1xyXG4gICAgbGV0IGN1cnJlbnRQb3MgPSBKU09OLnN0cmluZ2lmeShjdXJyZW50UG9zaXRpb24pO1xyXG4gICAgbGV0IGRpc3RhbmNlID0gZ2V0RGlzdGFuY2VUbyhldmVudC5tYXJrZXIpO1xyXG5cclxuICAgIC8vIENoYW5nZSB0aGUgY29udGVudCBvZiB0aGUgYm90dG9tIGJhciB0ZXh0XHJcbiAgICB0aGlzLndlbnR1cmVQb2ludFRpdGxlID0gZXZlbnQubWFya2VyLnRpdGxlO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChldmVudC5tYXJrZXIudGl0bGUgPT09IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpLnRpdGxlKSB7XHJcbiAgICAgICAgdGhpcy53ZW50dXJlUG9pbnRJbmZvID0gdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSkuaW5mbztcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlxcdFwiICsgdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSkuaW5mbyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBldmVudC5tYXJrZXIuc25pcHBldCA9IFwiRGlzdGFuY2U6IFwiICsgZGlzdGFuY2UudG9GaXhlZCgwKSArIFwiIG1cIjtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhcIlxcblxcdE1hcmtlclNlbGVjdDogXCIgKyBldmVudC5tYXJrZXIudGl0bGVcclxuICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdE1hcmtlciBwb3NpdGlvbjogXCIgKyBtYXJrZXJQb3NcclxuICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdEN1cnJlbnQgcG9zaXRpb246IFwiICsgY3VycmVudFBvc1xyXG4gICAgICAgICAgICAgICAgICArIFwiXFxuXFx0RGlzdGFuY2UgdG8gbWFya2VyOiBcIiArIGRpc3RhbmNlLnRvRml4ZWQoMikgKyBcIm1cIik7XHJcblxyXG4gICAgLy8gVGhpcyBtaWdodCBiZSBzdHVwaWQsIGJ1dCB3b3JrcyBmb3Igbm93IDopXHJcbiAgICAvL1RPRE86IGFkZGluZyBjb2xsZWN0ZWQgbWFya2VyIHRvIGEgbGlzdCBldGMuIGI0IHJlbW92aW5nXHJcbiAgICBmdW5jdGlvbiBjb2xsZWN0TWFya2VyKG1hcmspIHtcclxuICAgICAgY29sbGVjdERpc3RhbmNlID0gNTA7XHJcbiAgICAgIGlmKGdldERpc3RhbmNlVG8obWFyaykgPCBjb2xsZWN0RGlzdGFuY2UpIHtcclxuICAgICAgICBsZXQgYW1vdW50ID0gaG93TWFueUNvbGxlY3RlZCgpO1xyXG4gICAgICAgIGNvbGxlY3QoYW1vdW50ICk7XHJcbiAgICAgICAgLy9hbGVydChcIlZlbnR1cmUgcG9pbnQgY29sbGVjdGVkLiBcXG5Db2xsZWN0ZWQ6IFwiICsgYW1vdW50KTtcclxuICAgICAgICBjb2xsZWN0ZWRNYXJrZXJzLnB1c2gobWFyayk7XHJcbiAgICAgICAgbWFwVmlldy5yZW1vdmVNYXJrZXIobWFyayk7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJZb3UgaGF2ZSBcIiArIGNvbGxlY3RlZE1hcmtlcnMubGVuZ3RoICsgXCIgY29sbGVjdGVkIG1hcmtlcnMuXCIpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJcXG5NYXJrZXIgdG9vIGZhciBhd2F5LCBtb3ZlIGNsb3Nlci5cIik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb2xsZWN0TWFya2VyKGV2ZW50Lm1hcmtlcik7XHJcblxyXG4gIH07XHJcblxyXG4gIG9uTWFya2VyQmVnaW5EcmFnZ2luZyA9IChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJCZWdpbkRyYWdnaW5nXCIpO1xyXG4gIH07XHJcblxyXG4gIG9uTWFya2VyRW5kRHJhZ2dpbmcgPSAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyRW5kRHJhZ2dpbmdcIik7XHJcbiAgfTtcclxuXHJcbiAgb25NYXJrZXJEcmFnID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckRyYWdcIik7XHJcbiAgfTtcclxuXHJcbiAgb25DYW1lcmFDaGFuZ2VkID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIkNhbWVyYUNoYW5nZVwiKTtcclxuICAgIGNvbnNvbGUubG9nKFwiV2VudHVyZSBQb2ludHM6XCIpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc29sZS5sb2coXCJcXHRcIiArIEpTT04uc3RyaW5naWZ5KHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpKSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgb25TaGFwZVNlbGVjdCA9IChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coXCJZb3VyIGN1cnJlbnQgcG9zaXRpb24gaXM6IFwiICsgSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKSk7XHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0V2F0Y2goZXZlbnQpIHtcclxuXHJcbiAgaW50ZXJmYWNlIExvY2F0aW9uT2JqZWN0IHtcclxuICAgIFwibGF0aXR1ZGVcIjogbnVtYmVyLFxyXG4gICAgXCJsb25naXR1ZGVcIjogbnVtYmVyLFxyXG4gICAgXCJhbHRpdHVkZVwiOiBudW1iZXIsXHJcbiAgICBcImhvcml6b250YWxBY2N1cmFjeVwiOiBudW1iZXIsXHJcbiAgICBcInZlcnRpY2FsQWNjdXJhY3lcIjogbnVtYmVyLFxyXG4gICAgXCJzcGVlZFwiOiBudW1iZXIsXHJcbiAgICBcImRpcmVjdGlvblwiOiBudW1iZXIsXHJcbiAgICBcInRpbWVzdGFtcFwiOnN0cmluZ1xyXG4gIH1cclxuXHJcbiAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XHJcbiAgY3VycmVudFBvc0NpcmNsZSA9IG5ldyBtYXBzTW9kdWxlLkNpcmNsZSgpO1xyXG4gIGN1cnJlbnRQb3NDaXJjbGUuY2VudGVyID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcoMCwgMCk7XHJcbiAgY3VycmVudFBvc0NpcmNsZS52aXNpYmxlID0gdHJ1ZTtcclxuICBjdXJyZW50UG9zQ2lyY2xlLnJhZGl1cyA9IDIwO1xyXG4gIGN1cnJlbnRQb3NDaXJjbGUuZmlsbENvbG9yID0gbmV3IENvbG9yKCcjNmM5ZGYwJyk7XHJcbiAgY3VycmVudFBvc0NpcmNsZS5zdHJva2VDb2xvciA9IG5ldyBDb2xvcignIzM5NmFiZCcpO1xyXG4gIGN1cnJlbnRQb3NDaXJjbGUuc3Ryb2tld2lkdGggPSAyO1xyXG4gIGN1cnJlbnRQb3NDaXJjbGUuY2xpY2thYmxlID0gdHJ1ZTtcclxuICBtYXBWaWV3LmFkZENpcmNsZShjdXJyZW50UG9zQ2lyY2xlKTtcclxuXHJcbiAgd2F0Y2hJZCA9IGdlb2xvY2F0aW9uLndhdGNoTG9jYXRpb24oXHJcbiAgZnVuY3Rpb24gKGxvYykge1xyXG4gICAgICBpZiAobG9jKSB7XHJcbiAgICAgICAgICBsZXQgb2JqOiBMb2NhdGlvbk9iamVjdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobG9jKSk7XHJcbiAgICAgICAgICB0aGlzLmxhdGl0dWRlID0gb2JqLmxhdGl0dWRlO1xyXG4gICAgICAgICAgdGhpcy5sb25naXR1ZGUgPSBvYmoubG9uZ2l0dWRlO1xyXG4gICAgICAgICAgdGhpcy5hbHRpdHVkZSA9IG9iai5hbHRpdHVkZTtcclxuICAgICAgICAgIC8qdmFyKi9jdXJyZW50UG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyhvYmoubGF0aXR1ZGUsIG9iai5sb25naXR1ZGUpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2cobmV3IERhdGUoKSArIFwiXFxuUmVjZWl2ZWQgbG9jYXRpb246XFxuXFx0TGF0aXR1ZGU6IFwiICsgb2JqLmxhdGl0dWRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRMb25naXR1ZGU6IFwiICsgb2JqLmxvbmdpdHVkZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0QWx0aXR1ZGU6IFwiICsgb2JqLmFsdGl0dWRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRUaW1lc3RhbXA6IFwiICsgb2JqLnRpbWVzdGFtcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0RGlyZWN0aW9uOiBcIiArIG9iai5kaXJlY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcbkN1cnJlbnRQb3M6IFwiICsgSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKSk7XHJcblxyXG4gICAgICAgICAgY3VycmVudFBvc0NpcmNsZS5jZW50ZXIgPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyh0aGlzLmxhdGl0dWRlLCB0aGlzLmxvbmdpdHVkZSk7XHJcblxyXG4gICAgICAgICAgbWFwVmlldy5sYXRpdHVkZSA9IHRoaXMubGF0aXR1ZGU7XHJcbiAgICAgICAgICBtYXBWaWV3LmxvbmdpdHVkZSA9IHRoaXMubG9uZ2l0dWRlO1xyXG4gICAgICB9XHJcbiAgfSxcclxuICBmdW5jdGlvbihlKXtcclxuICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBlLm1lc3NhZ2UpO1xyXG4gIH0sXHJcbiAge2Rlc2lyZWRBY2N1cmFjeTogMywgdXBkYXRlRGlzdGFuY2U6IDEwLCBtaW5pbXVtVXBkYXRlVGltZSA6IDEwMDAgKiAyfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlbmRXYXRjaCgpIHtcclxuICAgIGlmICh3YXRjaElkKSB7XHJcbiAgICAgICAgZ2VvbG9jYXRpb24uY2xlYXJXYXRjaCh3YXRjaElkKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIk15IHdhdGNoIGlzIGVuZGVkLi4uIFQuIEpvbiBTbm93XCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyBUT0RPOiB0b2ltaW1hYW4gYW5kcm9pZGlsbGUga2Fuc3NhXHJcbmZ1bmN0aW9uIGdldERpc3RhbmNlVG8ob2JqKSB7XHJcbiAgbGV0IG9ialBvcyA9IEpTT04uc3RyaW5naWZ5KG9iai5wb3NpdGlvbik7XHJcbiAgbGV0IGN1cnJlbnRQb3MgPSBKU09OLnN0cmluZ2lmeShjdXJyZW50UG9zaXRpb24pO1xyXG4gIGxldCBkaXN0YW5jZSA9IG51bGw7XHJcblxyXG4gIGlmKGlzSU9TKSB7XHJcbiAgICAvL2NvbnNvbGUubG9nKFwiUnVubmluZyBvbiBpb3MuXCIpXHJcbiAgICBkaXN0YW5jZSA9IGdlb2xvY2F0aW9uLmRpc3RhbmNlKEpTT04ucGFyc2Uob2JqUG9zKS5faW9zLCBKU09OLnBhcnNlKGN1cnJlbnRQb3MpLl9pb3MpO1xyXG4gIH0gZWxzZSBpZihpc0FuZHJvaWQpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiUnVubmluZyBvbiBhbmRyb2lkLlwiKTtcclxuICAgIGRpc3RhbmNlID0gMzsvL2dlb2xvY2F0aW9uLmRpc3RhbmNlKEpTT04ucGFyc2Uob2JqUG9zKS5fYW5kcm9pZCwgSlNPTi5wYXJzZShjdXJyZW50UG9zKS5fYW5kcm9pZCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRpc3RhbmNlID0gXCJlcnJvclwiO1xyXG4gICAgY29uc29sZS5sb2coXCJDb3VsZCBub3QgZmluZCBkaXN0YW5jZS5cIik7XHJcbiAgfVxyXG4gICAgcmV0dXJuIGRpc3RhbmNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBob3dNYW55Q29sbGVjdGVkKCkge1xyXG4gIHJldHVybiBjb2xsZWN0ZWRNYXJrZXJzLmxlbmd0aCArIDE7XHJcbn1cclxuXHJcbi8vaGFuZGxlcyB0aGUgY29sbGVjdGlvbiBhbmQgcmV0dXJucyBtZXNzYWdlXHJcbmZ1bmN0aW9uIGNvbGxlY3QoYW1vdW50KSB7XHJcbiAgZGlhbG9nc01vZHVsZS5hbGVydCh7XHJcbiAgICBtZXNzYWdlOiBcIldlbnR1cmUgcG9pbnQgY29sbGVjdGVkISBcXG5Zb3UgaGF2ZTogXCIgKyBhbW91bnQsXHJcbiAgICBva0J1dHRvblRleHQ6IFwiT0tcIlxyXG4gIH0pO1xyXG59XHJcbiJdfQ==

