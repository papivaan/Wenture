"use strict";
var core_1 = require("@angular/core");
var platform_1 = require("platform");
var element_registry_1 = require("nativescript-angular/element-registry");
var modal_dialog_1 = require("nativescript-angular/modal-dialog");
var geolocation = require("nativescript-geolocation");
var router_1 = require("@angular/router");
var page_1 = require("ui/page");
var color_1 = require("color");
var wenturepoint_service_1 = require("../../shared/wenturepoint/wenturepoint.service");
var nativescript_sidedrawer_1 = require("nativescript-sidedrawer");
var prize_view_1 = require("./prize-view");
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
var selectedMarker;
element_registry_1.registerElement("MapView", function () { return require("nativescript-google-maps-sdk").MapView; });
var MapPageComponent = (function () {
    function MapPageComponent(router, wenturePointService, page, _modalService, vcRef) {
        var _this = this;
        this.router = router;
        this.wenturePointService = wenturePointService;
        this.page = page;
        this._modalService = _modalService;
        this.vcRef = vcRef;
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
            mapView = event.object;
            var gMap = mapView.gMap;
            _this.addWenturePoints(mapView);
        };
        this.onCoordinateTapped = function (event) {
            mapView = event.object;
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
            selectedMarker = event.marker;
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
    MapPageComponent.prototype.createModelView = function (mark) {
        var that = this;
        var options = {
            viewContainerRef: this.vcRef,
            context: "Context",
            fullscreen: true
        };
        // >> returning-result
        this._modalService.showModal(prize_view_1.PrizeViewComponent, options)
            .then(function () {
            console.log(mark.title);
            // TODO: Tässä sitten asetetaan sihen prize-viewiin markerin nimi
        });
        // << returning-result
    };
    MapPageComponent.prototype.collectButtonTapped = function () {
        // TODO: Tähän se keräystoiminto, if distance jtn, niin tuolta toi collect()
        // This might be stupid, but works for now :)
        //TODO: adding collected marker to a list etc. b4 removing
        collectDistance = 50;
        if (getDistanceTo(selectedMarker) < collectDistance) {
            var amount = howManyCollected();
            this.collect(amount, selectedMarker);
            //alert("Venture point collected. \nCollected: " + amount);
            collectedMarkers.push(selectedMarker);
            mapView.removeMarker(selectedMarker);
            //
            console.log("You have " + collectedMarkers.length + " collected markers.");
        }
        else {
            console.log("\nMarker too far away, move closer.");
        }
        console.log(selectedMarker.title);
    };
    MapPageComponent.prototype.collect = function (amount, mark) {
        this.createModelView(mark);
        /*dialogsModule.alert({
          message: "Wenture point " + mark.title + " collected! \nYou have: " + amount,
          okButtonText: "OK"
        });*/
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
        providers: [wenturepoint_service_1.WenturePointService, modal_dialog_1.ModalDialogService],
        templateUrl: "pages/map-page/map-page.html",
        styleUrls: ["pages/map-page/map-page-common.css", "pages/map-page/map-page.css"]
    }),
    __metadata("design:paramtypes", [router_1.Router, wenturepoint_service_1.WenturePointService, page_1.Page, modal_dialog_1.ModalDialogService, core_1.ViewContainerRef])
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
function collect(amount, mark) {
    //createModelView();
    dialogsModule.alert({
        message: "Wenture point " + mark.title + " collected! \nYou have: " + amount,
        okButtonText: "OK"
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBMkY7QUFDM0YscUNBQTRDO0FBQzVDLDBFQUFzRTtBQUN0RSxrRUFBMkY7QUFDM0Ysc0RBQXdEO0FBQ3hELDBDQUF5QztBQUN6QyxnQ0FBK0I7QUFDL0IsK0JBQThCO0FBSTlCLHVGQUFxRjtBQUNyRixtRUFBd0Q7QUFDeEQsMkNBQWtEO0FBRWxELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ3pELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMxQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3RDLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUUxQyxJQUFJLE9BQVksQ0FBQztBQUNqQixJQUFJLGVBQXlCLENBQUM7QUFDOUIsSUFBSSxnQkFBcUIsQ0FBQztBQUMxQixJQUFJLGVBQXVCLENBQUMsQ0FBQyx1REFBdUQ7QUFDcEYsSUFBSSxPQUFZLENBQUM7QUFDakIsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDMUIsSUFBSSxjQUFjLENBQUM7QUFFbkIsa0NBQWUsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLE9BQU8sRUFBL0MsQ0FBK0MsQ0FBQyxDQUFDO0FBVWxGLElBQWEsZ0JBQWdCO0lBWTNCLDBCQUFvQixNQUFjLEVBQVUsbUJBQXdDLEVBQVUsSUFBVSxFQUFVLGFBQWlDLEVBQVUsS0FBdUI7UUFBcEwsaUJBRUM7UUFGbUIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFVLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFNO1FB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TyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFDQyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFFRDtJQUNFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFFRCw0Q0FBNEM7QUFDNUMsaUJBQWlCLE1BQU0sRUFBRSxJQUFJO0lBQzNCLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDbEIsT0FBTyxFQUFFLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsMEJBQTBCLEdBQUcsTUFBTTtRQUM1RSxZQUFZLEVBQUUsSUFBSTtLQUNuQixDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBPbkluaXQsIFZpZXdDaGlsZCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBpc0FuZHJvaWQsIGlzSU9TIH0gZnJvbSBcInBsYXRmb3JtXCI7XG5pbXBvcnQge3JlZ2lzdGVyRWxlbWVudH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL2VsZW1lbnQtcmVnaXN0cnlcIjtcbmltcG9ydCB7IE1vZGFsRGlhbG9nU2VydmljZSwgTW9kYWxEaWFsb2dPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL21vZGFsLWRpYWxvZ1wiO1xuaW1wb3J0ICogYXMgZ2VvbG9jYXRpb24gZnJvbSBcIm5hdGl2ZXNjcmlwdC1nZW9sb2NhdGlvblwiO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gXCJ1aS9wYWdlXCI7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCJjb2xvclwiO1xuLy9pbXBvcnQgeyBJbWFnZSB9IGZyb20gXCJ1aS9pbWFnZVwiO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tIFwiaW1hZ2Utc291cmNlXCI7XG5pbXBvcnQgeyBXZW50dXJlUG9pbnQgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3dlbnR1cmVwb2ludC93ZW50dXJlcG9pbnRcIjtcbmltcG9ydCB7IFdlbnR1cmVQb2ludFNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3dlbnR1cmVwb2ludC93ZW50dXJlcG9pbnQuc2VydmljZVwiO1xuaW1wb3J0IHsgVG5zU2lkZURyYXdlciB9IGZyb20gJ25hdGl2ZXNjcmlwdC1zaWRlZHJhd2VyJztcbmltcG9ydCB7IFByaXplVmlld0NvbXBvbmVudCB9IGZyb20gXCIuL3ByaXplLXZpZXdcIjtcblxudmFyIG1hcHNNb2R1bGUgPSByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKTtcbnZhciBkaWFsb2dzTW9kdWxlID0gcmVxdWlyZShcInVpL2RpYWxvZ3NcIik7XG52YXIgSW1hZ2UgPSByZXF1aXJlKFwidWkvaW1hZ2VcIikuSW1hZ2U7XG52YXIgaW1hZ2VTb3VyY2UgPSByZXF1aXJlKFwiaW1hZ2Utc291cmNlXCIpO1xuXG52YXIgd2F0Y2hJZDogYW55O1xudmFyIGN1cnJlbnRQb3NpdGlvbjogTG9jYXRpb247XG52YXIgY3VycmVudFBvc0NpcmNsZTogYW55O1xudmFyIGNvbGxlY3REaXN0YW5jZTogbnVtYmVyOyAvL2Rpc3RhbmNlIGluIG0gb24gaG93IGNsb3NlIHRvIGVuYWJsZSBjb2xsZWN0LXByb3BlcnR5XG52YXIgbWFwVmlldzogYW55O1xudmFyIGNvbGxlY3RlZE1hcmtlcnMgPSBbXTtcbnZhciBzZWxlY3RlZE1hcmtlcjtcblxucmVnaXN0ZXJFbGVtZW50KFwiTWFwVmlld1wiLCAoKSA9PiByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKS5NYXBWaWV3KTtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm1hcC1wYWdlXCIsXG4gIHByb3ZpZGVyczogW1dlbnR1cmVQb2ludFNlcnZpY2UsIE1vZGFsRGlhbG9nU2VydmljZV0sXG4gIHRlbXBsYXRlVXJsOiBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmh0bWxcIixcbiAgc3R5bGVVcmxzOiBbXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS1jb21tb24uY3NzXCIsIFwicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UuY3NzXCJdXG59KVxuXG5cbmV4cG9ydCBjbGFzcyBNYXBQYWdlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQFZpZXdDaGlsZChcIk1hcFZpZXdcIikgbWFwVmlldzogRWxlbWVudFJlZjtcblxuICBsYXRpdHVkZTogbnVtYmVyO1xuICBsb25naXR1ZGU6IG51bWJlcjtcbiAgYWx0aXR1ZGU6IG51bWJlcjtcbiAgd2VudHVyZVBvaW50VGl0bGU6IHN0cmluZztcbiAgd2VudHVyZVBvaW50SW5mbzogc3RyaW5nO1xuICBtYXJrZXJJc1NlbGVjdGVkOiBib29sZWFuO1xuICAvL2kgc3RvcmVzIHRoZSBpbmRleCB2YWx1ZSBvZiBtZW51XG4gIGk6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByb3V0ZXI6IFJvdXRlciwgcHJpdmF0ZSB3ZW50dXJlUG9pbnRTZXJ2aWNlOiBXZW50dXJlUG9pbnRTZXJ2aWNlLCBwcml2YXRlIHBhZ2U6IFBhZ2UsIHByaXZhdGUgX21vZGFsU2VydmljZTogTW9kYWxEaWFsb2dTZXJ2aWNlLCBwcml2YXRlIHZjUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7XG5cbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIFRPRE86IExvYWRlcj9cbiAgICAvLyBUT0RPOiBtZW51aXRlbSBpY29uaXQgcHV1dHR1dSwgYWN0aW9uYmFyaW4gbWFoZCBwaWlsb3R0YW1pbmVuKD8pXG4gICAgVG5zU2lkZURyYXdlci5idWlsZCh7XG4gICAgICB0ZW1wbGF0ZXM6IFt7XG4gICAgICAgICAgdGl0bGU6ICdXZW50dXJlcG9pbnRzJyxcbiAgICAgICAgICAvL2FuZHJvaWRJY29uOiAnaWNfaG9tZV93aGl0ZV8yNGRwJyxcbiAgICAgICAgICAvL2lvc0ljb246ICdpY19ob21lX3doaXRlJyxcbiAgICAgIH0sIHtcbiAgICAgICAgICB0aXRsZTogJ1JvdXRlcycsXG4gICAgICAgICAgLy9hbmRyb2lkSWNvbjogJ2ljX2dhdmVsX3doaXRlXzI0ZHAnLFxuICAgICAgICAgIC8vaW9zSWNvbjogJ2ljX2dhdmVsX3doaXRlJyxcbiAgICAgIH0sIHtcbiAgICAgICAgICB0aXRsZTogJ015IFdlbnR1cmVzJyxcbiAgICAgICAgICAvL2FuZHJvaWRJY29uOiAnaWNfYWNjb3VudF9iYWxhbmNlX3doaXRlXzI0ZHAnLFxuICAgICAgICAgIC8vaW9zSWNvbjogJ2ljX2FjY291bnRfYmFsYW5jZV93aGl0ZScsXG4gICAgICB9LCB7XG4gICAgICAgICAgdGl0bGU6ICdTZXR0aW5ncycsXG4gICAgICAgIC8vICBhbmRyb2lkSWNvbjogJ2ljX2J1aWxkX3doaXRlXzI0ZHAnLFxuICAgICAgICAvLyAgaW9zSWNvbjogJ2ljX2J1aWxkX3doaXRlJyxcbiAgICAgIH0sIHtcbiAgICAgICAgICB0aXRsZTogJ0xvZyBvdXQnLFxuICAgICAgICAvLyAgYW5kcm9pZEljb246ICdpY19hY2NvdW50X2NpcmNsZV93aGl0ZV8yNGRwJyxcbiAgICAgICAgLy8gIGlvc0ljb246ICdpY19hY2NvdW50X2NpcmNsZV93aGl0ZScsXG4gICAgICB9XSxcbiAgICAgIHRpdGxlOiAnV2VudHVyZScsXG4gICAgICBzdWJ0aXRsZTogJ3lvdXIgdXJiYW4gYWR2ZW50dXJlIScsXG4gICAgICBsaXN0ZW5lcjogKGluZGV4KSA9PiB7XG4gICAgICAgICAgdGhpcy5pID0gaW5kZXhcbiAgICAgIH0sXG4gICAgICBjb250ZXh0OiB0aGlzLFxuICAgIH0pO1xuXG4gIH1cblxuICB0b2dnbGVTaWRlRHJhd2VyKCkge1xuICAgIFRuc1NpZGVEcmF3ZXIudG9nZ2xlKCk7XG4gIH1cblxuICBjcmVhdGVNb2RlbFZpZXcoKSB7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIGxldCBvcHRpb25zOiBNb2RhbERpYWxvZ09wdGlvbnMgPSB7XG4gICAgICAgIHZpZXdDb250YWluZXJSZWY6IHRoaXMudmNSZWYsXG4gICAgICAgIGNvbnRleHQ6IFwiQ29udGV4dFwiLFxuICAgICAgICBmdWxsc2NyZWVuOiB0cnVlXG4gICAgfTtcbiAgICAvLyA+PiByZXR1cm5pbmctcmVzdWx0XG4gICAgdGhpcy5fbW9kYWxTZXJ2aWNlLnNob3dNb2RhbChQcml6ZVZpZXdDb21wb25lbnQsIG9wdGlvbnMpXG4gICAgICAgIC50aGVuKCgvKiAqLykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJLdWtrdXVcIik7XG4gICAgICAgICAgICAvLyA+PiAoaGlkZSlcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBpZiAoYXJncyA9PT0gXCJzdGFydFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydERhdGUgPSBkYXRlcmVzdWx0O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzID09PSBcImVuZFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmREYXRlID0gZGF0ZXJlc3VsdDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncyA9PT0gXCJmaW5kVGhlRGF5XCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUgPSBkYXRlcmVzdWx0O1xuICAgICAgICAgICAgICAgIHRoaXMud2Vla2RheSA9IHRoaXMud2Vla2RheXNbdGhpcy5kYXRlLmdldERheSgpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICAvLyA8PCAoaGlkZSlcbiAgICAgICAgfSk7XG4gICAgLy8gPDwgcmV0dXJuaW5nLXJlc3VsdFxuICB9XG5cbiAgY29sbGVjdEJ1dHRvblRhcHBlZCgpIHtcbiAgICAvLyBUT0RPOiBUw6Row6RuIHNlIGtlcsOkeXN0b2ltaW50bywgaWYgZGlzdGFuY2UganRuLCBuaWluIHR1b2x0YSB0b2kgY29sbGVjdCgpXG4gICAgLy8gVGhpcyBtaWdodCBiZSBzdHVwaWQsIGJ1dCB3b3JrcyBmb3Igbm93IDopXG4gICAgLy9UT0RPOiBhZGRpbmcgY29sbGVjdGVkIG1hcmtlciB0byBhIGxpc3QgZXRjLiBiNCByZW1vdmluZ1xuXG4gICAgICBjb2xsZWN0RGlzdGFuY2UgPSA1MDtcbiAgICAgIGlmKGdldERpc3RhbmNlVG8oc2VsZWN0ZWRNYXJrZXIpIDwgY29sbGVjdERpc3RhbmNlKSB7XG4gICAgICAgIGxldCBhbW91bnQgPSBob3dNYW55Q29sbGVjdGVkKCk7XG4gICAgICAgIGNvbGxlY3QoYW1vdW50LCBzZWxlY3RlZE1hcmtlciApO1xuICAgICAgICAvL2FsZXJ0KFwiVmVudHVyZSBwb2ludCBjb2xsZWN0ZWQuIFxcbkNvbGxlY3RlZDogXCIgKyBhbW91bnQpO1xuICAgICAgICBjb2xsZWN0ZWRNYXJrZXJzLnB1c2goc2VsZWN0ZWRNYXJrZXIpO1xuICAgICAgICBtYXBWaWV3LnJlbW92ZU1hcmtlcihzZWxlY3RlZE1hcmtlcik7XG4gICAgICAgIC8vXG4gICAgICAgIGNvbnNvbGUubG9nKFwiWW91IGhhdmUgXCIgKyBjb2xsZWN0ZWRNYXJrZXJzLmxlbmd0aCArIFwiIGNvbGxlY3RlZCBtYXJrZXJzLlwiKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJcXG5NYXJrZXIgdG9vIGZhciBhd2F5LCBtb3ZlIGNsb3Nlci5cIik7XG4gICAgICB9XG5cblxuXG4gICAgY29uc29sZS5sb2coXCJISUpLS0pIXCIgKyBzZWxlY3RlZE1hcmtlci50aXRsZSk7XG5cbiAgfVxuXG4gIGFkZFdlbnR1cmVQb2ludHMobWFwVmlldykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgd1BvaW50ID0gdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSk7XG4gICAgICB2YXIgbWFya2VyID0gbmV3IG1hcHNNb2R1bGUuTWFya2VyKCk7XG5cbiAgICAgIG1hcmtlci5wb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKHdQb2ludC5sYXQsIHdQb2ludC5sbmcpO1xuICAgICAgbWFya2VyLnRpdGxlID0gd1BvaW50LnRpdGxlO1xuICAgICAgbWFya2VyLnNuaXBwZXQgPSBcIlwiO1xuICAgICAgLy9BbmRyb2lkaWxsYSB0b2ltaWkuIElvc2lsbGUgcGl0w6TDpCBrYXRzb2EgbWl0ZW4gcmVzb3VyY2UgdG9pbWlpLiBQQzpsbMOkIGVpIHB5c3R5dMOkIHRlc3RhYW1hYW5cbiAgICAgIC8vSWtvbmlhIGpvdXR1dSBoaWVtbmEgbXVva2thYW1hYW4ocGllbmVtbcOka3NpIGphIGxpc8OkdMOkw6RuIHBpZW5pIG9zb2l0aW4gYWxhbGFpdGFhbilcbiAgICAgIHZhciBpY29uID0gbmV3IEltYWdlKCk7XG4gICAgICBpY29uLmltYWdlU291cmNlID0gaW1hZ2VTb3VyY2UuZnJvbVJlc291cmNlKCdpY29uJyk7XG4gICAgICBtYXJrZXIuaWNvbiA9IGljb247XG4gICAgICBtYXJrZXIuZHJhZ2dhYmxlID0gdHJ1ZTtcbiAgICAgIG1hcmtlci51c2VyRGF0YSA9IHtpbmRleDogMX07XG4gICAgICBtYXBWaWV3LmFkZE1hcmtlcihtYXJrZXIpO1xuXG4gICAgfVxuICB9XG5cbiAgLy9NYXAgZXZlbnRzXG4gIG9uTWFwUmVhZHkgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcCBSZWFkeVwiKTtcbiAgICBzdGFydFdhdGNoKGV2ZW50KTtcblxuICAgIC8vIENoZWNrIGlmIGxvY2F0aW9uIHNlcnZpY2VzIGFyZSBlbmFibGVkXG4gICAgaWYgKCFnZW9sb2NhdGlvbi5pc0VuYWJsZWQoKSkge1xuICAgICAgICBnZW9sb2NhdGlvbi5lbmFibGVMb2NhdGlvblJlcXVlc3QoKTtcbiAgICB9IGVsc2UgY29uc29sZS5sb2coXCJBbGxlcyBpbiBPcmRudW5nXCIpO1xuXG4gICAgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgICB2YXIgZ01hcCA9IG1hcFZpZXcuZ01hcDtcblxuICAgIHRoaXMuYWRkV2VudHVyZVBvaW50cyhtYXBWaWV3KTtcblxuICB9O1xuXG4gIG9uQ29vcmRpbmF0ZVRhcHBlZCA9IChldmVudCkgPT4ge1xuICAgIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG4gICAgdGhpcy53ZW50dXJlUG9pbnRUaXRsZSA9IFwiXCI7XG4gICAgdGhpcy53ZW50dXJlUG9pbnRJbmZvID0gXCJcIjtcbiAgICBjb25zb2xlLmxvZyhcIkNvb3JkaW5hdGUgdGFwcGVkLlwiKTtcbiAgICB0aGlzLm1hcmtlcklzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgfTtcblxuICBvbkNvb3JkaW5hdGVMb25nUHJlc3MgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIkxvbmdQcmVzc1wiKTtcblxuICAgIHZhciBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xuICAgIHZhciBsYXQgPSBldmVudC5wb3NpdGlvbi5sYXRpdHVkZTtcbiAgICB2YXIgbG5nID0gZXZlbnQucG9zaXRpb24ubG9uZ2l0dWRlO1xuXG4gICAgY29uc29sZS5sb2coXCJUYXBwZWQgbG9jYXRpb246IFxcblxcdExhdGl0dWRlOiBcIiArIGV2ZW50LnBvc2l0aW9uLmxhdGl0dWRlICtcbiAgICAgICAgICAgICAgICAgICAgXCJcXG5cXHRMb25naXR1ZGU6IFwiICsgZXZlbnQucG9zaXRpb24ubG9uZ2l0dWRlKTtcblxuLyogIFTDpHTDpCB2b2kga8OkeXR0w6TDpCB0ZXN0YWlsdXVuLCBqb3MgaGFsdWFhIGxpc8OkdMOkIG1hcmtlcmVpdGEuXG4gICAgdmFyIG1hcmtlciA9IG5ldyBtYXBzTW9kdWxlLk1hcmtlcigpO1xuICAgIG1hcmtlci5wb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKGxhdCwgbG5nKTtcbiAgICBtYXJrZXIudGl0bGUgPSBcIldlbnR1cmUgcG9pbnRcIjtcbiAgICBtYXJrZXIuc25pcHBldCA9IFwiXCI7XG4gICAgLy9BbmRyb2lkaWxsYSB0b2ltaWkuIElvc2lsbGUgcGl0w6TDpCBrYXRzb2EgbWl0ZW4gcmVzb3VyY2UgdG9pbWlpLiBQQzpsbMOkIGVpIHB5c3R5dMOkIHRlc3RhYW1hYW5cbiAgICAvL0lrb25pYSBqb3V0dXUgaGllbW5hIG11b2trYWFtYWFuIHBpZW5lbW3DpGtzaSBqYSBsaXPDpHTDpMOkbiBwaWVuaSBvc29pdGluIGFsYWxhaXRhYW4pXG4gICAgdmFyIGljb24gPSBuZXcgSW1hZ2UoKTtcbiAgICBpY29uLmltYWdlU291cmNlID0gaW1hZ2VTb3VyY2UuZnJvbVJlc291cmNlKCdpY29uJyk7XG4gICAgbWFya2VyLmljb24gPSBpY29uO1xuICAgIG1hcmtlci5kcmFnZ2FibGUgPSB0cnVlO1xuICAgIG1hcmtlci51c2VyRGF0YSA9IHtpbmRleDogMX07XG4gICAgbWFwVmlldy5hZGRNYXJrZXIobWFya2VyKTtcbiAgKi9cbiAgICB0aGlzLmNyZWF0ZU1vZGVsVmlldygpO1xuICB9O1xuXG4gIC8vIFRPRE86IFTDpG3DpG4gdm9pc2kgc2lpcnTDpMOkIGpvaG9ua2luIGZpa3N1bXBhYW4gcGFpa2thYW4uXG4gIFRuc1NpZGVEcmF3ZXJPcHRpb25zTGlzdGVuZXIgPSAoaW5kZXgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhpbmRleClcbiAgfTtcblxuICBvbk1hcmtlclNlbGVjdCA9IChldmVudCkgPT4ge1xuXG4gICAgaW50ZXJmYWNlIFBvc2l0aW9uT2JqZWN0IHtcbiAgICAgIFwibGF0aXR1ZGVcIjogc3RyaW5nLFxuICAgICAgXCJsb25naXR1ZGVcIjogc3RyaW5nXG4gICAgfVxuXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG5cbiAgICBsZXQgbWFya2VyUG9zID0gSlNPTi5zdHJpbmdpZnkoZXZlbnQubWFya2VyLnBvc2l0aW9uKTtcbiAgICBsZXQgY3VycmVudFBvcyA9IEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbik7XG4gICAgbGV0IGRpc3RhbmNlID0gZ2V0RGlzdGFuY2VUbyhldmVudC5tYXJrZXIpO1xuXG4gICAgLy8gTWFrZSBib3R0b20gYmFyIHZpc2libGVcbiAgICB0aGlzLm1hcmtlcklzU2VsZWN0ZWQgPSB0cnVlO1xuXG4gICAgLy8gQ2hhbmdlIHRoZSBjb250ZW50IG9mIHRoZSBib3R0b20gYmFyIHRleHRcbiAgICB0aGlzLndlbnR1cmVQb2ludFRpdGxlID0gZXZlbnQubWFya2VyLnRpdGxlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChldmVudC5tYXJrZXIudGl0bGUgPT09IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpLnRpdGxlKSB7XG4gICAgICAgIHRoaXMud2VudHVyZVBvaW50SW5mbyA9IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpLmluZm87XG4gICAgICAgIGNvbnNvbGUubG9nKFwiXFx0XCIgKyB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkuZ2V0SXRlbShpKS5pbmZvKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBldmVudC5tYXJrZXIuc25pcHBldCA9IFwiRGlzdGFuY2U6IFwiICsgZGlzdGFuY2UudG9GaXhlZCgwKSArIFwiIG1cIjtcblxuICAgIGNvbnNvbGUubG9nKFwiXFxuXFx0TWFya2VyU2VsZWN0OiBcIiArIGV2ZW50Lm1hcmtlci50aXRsZVxuICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdE1hcmtlciBwb3NpdGlvbjogXCIgKyBtYXJrZXJQb3NcbiAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRDdXJyZW50IHBvc2l0aW9uOiBcIiArIGN1cnJlbnRQb3NcbiAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHREaXN0YW5jZSB0byBtYXJrZXI6IFwiICsgZGlzdGFuY2UudG9GaXhlZCgyKSArIFwibVwiKTtcblxuXG4gICAgc2VsZWN0ZWRNYXJrZXIgPSBldmVudC5tYXJrZXI7XG5cblxuXG4gIH07XG5cbiAgb25NYXJrZXJCZWdpbkRyYWdnaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJCZWdpbkRyYWdnaW5nXCIpO1xuICB9O1xuXG4gIG9uTWFya2VyRW5kRHJhZ2dpbmcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckVuZERyYWdnaW5nXCIpO1xuICB9O1xuXG4gIG9uTWFya2VyRHJhZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyRHJhZ1wiKTtcbiAgfTtcblxuICBvbkNhbWVyYUNoYW5nZWQgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIkNhbWVyYUNoYW5nZVwiKTtcbiAgICBjb25zb2xlLmxvZyhcIldlbnR1cmUgUG9pbnRzOlwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc29sZS5sb2coXCJcXHRcIiArIEpTT04uc3RyaW5naWZ5KHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpKSk7XG4gICAgfVxuICB9O1xuXG4gIG9uU2hhcGVTZWxlY3QgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIllvdXIgY3VycmVudCBwb3NpdGlvbiBpczogXCIgKyBKU09OLnN0cmluZ2lmeShjdXJyZW50UG9zaXRpb24pKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0V2F0Y2goZXZlbnQpIHtcblxuICBpbnRlcmZhY2UgTG9jYXRpb25PYmplY3Qge1xuICAgIFwibGF0aXR1ZGVcIjogbnVtYmVyLFxuICAgIFwibG9uZ2l0dWRlXCI6IG51bWJlcixcbiAgICBcImFsdGl0dWRlXCI6IG51bWJlcixcbiAgICBcImhvcml6b250YWxBY2N1cmFjeVwiOiBudW1iZXIsXG4gICAgXCJ2ZXJ0aWNhbEFjY3VyYWN5XCI6IG51bWJlcixcbiAgICBcInNwZWVkXCI6IG51bWJlcixcbiAgICBcImRpcmVjdGlvblwiOiBudW1iZXIsXG4gICAgXCJ0aW1lc3RhbXBcIjpzdHJpbmdcbiAgfVxuXG4gIHZhciBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xuICBjdXJyZW50UG9zQ2lyY2xlID0gbmV3IG1hcHNNb2R1bGUuQ2lyY2xlKCk7XG4gIGN1cnJlbnRQb3NDaXJjbGUuY2VudGVyID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcoMCwgMCk7XG4gIGN1cnJlbnRQb3NDaXJjbGUudmlzaWJsZSA9IHRydWU7XG4gIGN1cnJlbnRQb3NDaXJjbGUucmFkaXVzID0gMjA7XG4gIGN1cnJlbnRQb3NDaXJjbGUuZmlsbENvbG9yID0gbmV3IENvbG9yKCcjNmM5ZGYwJyk7XG4gIGN1cnJlbnRQb3NDaXJjbGUuc3Ryb2tlQ29sb3IgPSBuZXcgQ29sb3IoJyMzOTZhYmQnKTtcbiAgY3VycmVudFBvc0NpcmNsZS5zdHJva2V3aWR0aCA9IDI7XG4gIGN1cnJlbnRQb3NDaXJjbGUuY2xpY2thYmxlID0gdHJ1ZTtcbiAgbWFwVmlldy5hZGRDaXJjbGUoY3VycmVudFBvc0NpcmNsZSk7XG5cbiAgd2F0Y2hJZCA9IGdlb2xvY2F0aW9uLndhdGNoTG9jYXRpb24oXG4gIGZ1bmN0aW9uIChsb2MpIHtcbiAgICAgIGlmIChsb2MpIHtcbiAgICAgICAgICBsZXQgb2JqOiBMb2NhdGlvbk9iamVjdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobG9jKSk7XG4gICAgICAgICAgdGhpcy5sYXRpdHVkZSA9IG9iai5sYXRpdHVkZTtcbiAgICAgICAgICB0aGlzLmxvbmdpdHVkZSA9IG9iai5sb25naXR1ZGU7XG4gICAgICAgICAgdGhpcy5hbHRpdHVkZSA9IG9iai5hbHRpdHVkZTtcbiAgICAgICAgICAvKnZhciovY3VycmVudFBvc2l0aW9uID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcob2JqLmxhdGl0dWRlLCBvYmoubG9uZ2l0dWRlKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhuZXcgRGF0ZSgpICsgXCJcXG5SZWNlaXZlZCBsb2NhdGlvbjpcXG5cXHRMYXRpdHVkZTogXCIgKyBvYmoubGF0aXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRMb25naXR1ZGU6IFwiICsgb2JqLmxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdEFsdGl0dWRlOiBcIiArIG9iai5hbHRpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdFRpbWVzdGFtcDogXCIgKyBvYmoudGltZXN0YW1wXG4gICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0RGlyZWN0aW9uOiBcIiArIG9iai5kaXJlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXG5DdXJyZW50UG9zOiBcIiArIEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbikpO1xuXG4gICAgICAgICAgY3VycmVudFBvc0NpcmNsZS5jZW50ZXIgPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyh0aGlzLmxhdGl0dWRlLCB0aGlzLmxvbmdpdHVkZSk7XG5cbiAgICAgICAgICBtYXBWaWV3LmxhdGl0dWRlID0gdGhpcy5sYXRpdHVkZTtcbiAgICAgICAgICBtYXBWaWV3LmxvbmdpdHVkZSA9IHRoaXMubG9uZ2l0dWRlO1xuICAgICAgfVxuICB9LFxuICBmdW5jdGlvbihlKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgZS5tZXNzYWdlKTtcbiAgfSxcbiAge2Rlc2lyZWRBY2N1cmFjeTogMywgdXBkYXRlRGlzdGFuY2U6IDEwLCBtaW5pbXVtVXBkYXRlVGltZSA6IDEwMDAgKiAyfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmRXYXRjaCgpIHtcbiAgICBpZiAod2F0Y2hJZCkge1xuICAgICAgICBnZW9sb2NhdGlvbi5jbGVhcldhdGNoKHdhdGNoSWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIk15IHdhdGNoIGlzIGVuZGVkLi4uIFQuIEpvbiBTbm93XCIpO1xuICAgIH1cbn1cblxuLy8gVE9ETzogdG9pbWltYWFuIGFuZHJvaWRpbGxlIGthbnNzYVxuZnVuY3Rpb24gZ2V0RGlzdGFuY2VUbyhvYmopIHtcbiAgbGV0IG9ialBvcyA9IEpTT04uc3RyaW5naWZ5KG9iai5wb3NpdGlvbik7XG4gIGxldCBjdXJyZW50UG9zID0gSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKTtcbiAgbGV0IGRpc3RhbmNlID0gbnVsbDtcblxuICBpZihpc0lPUykge1xuICAgIC8vY29uc29sZS5sb2coXCJSdW5uaW5nIG9uIGlvcy5cIilcbiAgICBkaXN0YW5jZSA9IGdlb2xvY2F0aW9uLmRpc3RhbmNlKEpTT04ucGFyc2Uob2JqUG9zKS5faW9zLCBKU09OLnBhcnNlKGN1cnJlbnRQb3MpLl9pb3MpO1xuICB9IGVsc2UgaWYoaXNBbmRyb2lkKSB7XG4gICAgY29uc29sZS5sb2coXCJSdW5uaW5nIG9uIGFuZHJvaWQuXCIpO1xuICAgIGRpc3RhbmNlID0gMzsvL2dlb2xvY2F0aW9uLmRpc3RhbmNlKEpTT04ucGFyc2Uob2JqUG9zKS5fYW5kcm9pZCwgSlNPTi5wYXJzZShjdXJyZW50UG9zKS5fYW5kcm9pZCk7XG4gIH0gZWxzZSB7XG4gICAgZGlzdGFuY2UgPSBcImVycm9yXCI7XG4gICAgY29uc29sZS5sb2coXCJDb3VsZCBub3QgZmluZCBkaXN0YW5jZS5cIik7XG4gIH1cbiAgICByZXR1cm4gZGlzdGFuY2U7XG59XG5cbmZ1bmN0aW9uIGhvd01hbnlDb2xsZWN0ZWQoKSB7XG4gIHJldHVybiBjb2xsZWN0ZWRNYXJrZXJzLmxlbmd0aCArIDE7XG59XG5cbi8vaGFuZGxlcyB0aGUgY29sbGVjdGlvbiBhbmQgcmV0dXJucyBtZXNzYWdlXG5mdW5jdGlvbiBjb2xsZWN0KGFtb3VudCwgbWFyaykge1xuICBkaWFsb2dzTW9kdWxlLmFsZXJ0KHtcbiAgICBtZXNzYWdlOiBcIldlbnR1cmUgcG9pbnQgXCIgKyBtYXJrLnRpdGxlICsgXCIgY29sbGVjdGVkISBcXG5Zb3UgaGF2ZTogXCIgKyBhbW91bnQsXG4gICAgb2tCdXR0b25UZXh0OiBcIk9LXCJcbiAgfSk7XG59XG4iXX0=

