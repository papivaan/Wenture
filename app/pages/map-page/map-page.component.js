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
        this._i = 0;
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
            if (distance < 50) {
                _this.isCloseEnoughToCollect = true;
            }
            else
                _this.isCloseEnoughToCollect = false;
            var collectButton = _this.collectButton.nativeElement;
            var collectButtonColor = new color_1.Color(_this.isCloseEnoughToCollect ? "#CB1D00" : "#484848");
            collectButton.backgroundColor = collectButtonColor;
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
    Object.defineProperty(MapPageComponent.prototype, "i", {
        get: function () {
            return this._i;
        },
        //tähän kaikki mitä halutaan tapahtuvan menusta
        set: function (i) {
            this._i = i;
            console.log(this.i);
        },
        enumerable: true,
        configurable: true
    });
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
__decorate([
    core_1.ViewChild("collectButton"),
    __metadata("design:type", core_1.ElementRef)
], MapPageComponent.prototype, "collectButton", void 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBMkY7QUFDM0YscUNBQTRDO0FBQzVDLDBFQUFzRTtBQUN0RSxrRUFBMkY7QUFDM0Ysc0RBQXdEO0FBQ3hELDBDQUF5QztBQUN6QyxnQ0FBK0I7QUFFL0IsK0JBQThCO0FBSTlCLHVGQUFxRjtBQUNyRixtRUFBd0Q7QUFFeEQsMkNBQWtEO0FBRWxELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ3pELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMxQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3RDLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUUxQyxJQUFJLE9BQVksQ0FBQztBQUNqQixJQUFJLGVBQXlCLENBQUM7QUFDOUIsSUFBSSxnQkFBcUIsQ0FBQztBQUMxQixJQUFJLGVBQXVCLENBQUMsQ0FBQyx1REFBdUQ7QUFDcEYsSUFBSSxPQUFZLENBQUM7QUFDakIsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDMUIsSUFBSSxjQUFjLENBQUM7QUFFbkIsa0NBQWUsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLE9BQU8sRUFBL0MsQ0FBK0MsQ0FBQyxDQUFDO0FBVWxGLElBQWEsZ0JBQWdCO0lBdUIzQiwwQkFBb0IsTUFBYyxFQUFVLG1CQUF3QyxFQUFVLElBQVUsRUFBVSxhQUFpQyxFQUFVLEtBQXVCO1FBQXBMLGlCQUVDO1FBRm1CLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQVUsU0FBSSxHQUFKLElBQUksQ0FBTTtR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QyxLQUFLLEdBQUcsMEJBQTBCLEdBQUcsTUFBTTtRQUM1RSxZQUFZLEVBQUUsSUFBSTtLQUNuQixDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBPbkluaXQsIFZpZXdDaGlsZCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IGlzQW5kcm9pZCwgaXNJT1MgfSBmcm9tIFwicGxhdGZvcm1cIjtcclxuaW1wb3J0IHtyZWdpc3RlckVsZW1lbnR9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9lbGVtZW50LXJlZ2lzdHJ5XCI7XHJcbmltcG9ydCB7IE1vZGFsRGlhbG9nU2VydmljZSwgTW9kYWxEaWFsb2dPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL21vZGFsLWRpYWxvZ1wiO1xyXG5pbXBvcnQgKiBhcyBnZW9sb2NhdGlvbiBmcm9tIFwibmF0aXZlc2NyaXB0LWdlb2xvY2F0aW9uXCI7XHJcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcclxuaW1wb3J0IHsgUGFnZSB9IGZyb20gXCJ1aS9wYWdlXCI7XHJcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gXCJ1aS9idXR0b25cIjtcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tIFwiY29sb3JcIjtcclxuLy9pbXBvcnQgeyBJbWFnZSB9IGZyb20gXCJ1aS9pbWFnZVwiO1xyXG5pbXBvcnQgeyBJbWFnZVNvdXJjZSB9IGZyb20gXCJpbWFnZS1zb3VyY2VcIjtcclxuaW1wb3J0IHsgV2VudHVyZVBvaW50IH0gZnJvbSBcIi4uLy4uL3NoYXJlZC93ZW50dXJlcG9pbnQvd2VudHVyZXBvaW50XCI7XHJcbmltcG9ydCB7IFdlbnR1cmVQb2ludFNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3dlbnR1cmVwb2ludC93ZW50dXJlcG9pbnQuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBUbnNTaWRlRHJhd2VyIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXNpZGVkcmF3ZXInO1xyXG5pbXBvcnQgeyBUbnNTaWRlRHJhd2VyT3B0aW9uc0xpc3RlbmVyIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXNpZGVkcmF3ZXInO1xyXG5pbXBvcnQgeyBQcml6ZVZpZXdDb21wb25lbnQgfSBmcm9tIFwiLi9wcml6ZS12aWV3XCI7XHJcblxyXG52YXIgbWFwc01vZHVsZSA9IHJlcXVpcmUoXCJuYXRpdmVzY3JpcHQtZ29vZ2xlLW1hcHMtc2RrXCIpO1xyXG52YXIgZGlhbG9nc01vZHVsZSA9IHJlcXVpcmUoXCJ1aS9kaWFsb2dzXCIpO1xyXG52YXIgSW1hZ2UgPSByZXF1aXJlKFwidWkvaW1hZ2VcIikuSW1hZ2U7XHJcbnZhciBpbWFnZVNvdXJjZSA9IHJlcXVpcmUoXCJpbWFnZS1zb3VyY2VcIik7XHJcblxyXG52YXIgd2F0Y2hJZDogYW55O1xyXG52YXIgY3VycmVudFBvc2l0aW9uOiBMb2NhdGlvbjtcclxudmFyIGN1cnJlbnRQb3NDaXJjbGU6IGFueTtcclxudmFyIGNvbGxlY3REaXN0YW5jZTogbnVtYmVyOyAvL2Rpc3RhbmNlIGluIG0gb24gaG93IGNsb3NlIHRvIGVuYWJsZSBjb2xsZWN0LXByb3BlcnR5XHJcbnZhciBtYXBWaWV3OiBhbnk7XHJcbnZhciBjb2xsZWN0ZWRNYXJrZXJzID0gW107XHJcbnZhciBzZWxlY3RlZE1hcmtlcjtcclxuXHJcbnJlZ2lzdGVyRWxlbWVudChcIk1hcFZpZXdcIiwgKCkgPT4gcmVxdWlyZShcIm5hdGl2ZXNjcmlwdC1nb29nbGUtbWFwcy1zZGtcIikuTWFwVmlldyk7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogXCJtYXAtcGFnZVwiLFxyXG4gIHByb3ZpZGVyczogW1dlbnR1cmVQb2ludFNlcnZpY2UsIE1vZGFsRGlhbG9nU2VydmljZV0sXHJcbiAgdGVtcGxhdGVVcmw6IFwicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UuaHRtbFwiLFxyXG4gIHN0eWxlVXJsczogW1wicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UtY29tbW9uLmNzc1wiLCBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmNzc1wiXVxyXG59KVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBNYXBQYWdlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcclxuICBAVmlld0NoaWxkKFwiTWFwVmlld1wiKSBtYXBWaWV3OiBFbGVtZW50UmVmO1xyXG4gIEBWaWV3Q2hpbGQoXCJjb2xsZWN0QnV0dG9uXCIpIGNvbGxlY3RCdXR0b246IEVsZW1lbnRSZWY7XHJcblxyXG4gIGxhdGl0dWRlOiBudW1iZXI7XHJcbiAgbG9uZ2l0dWRlOiBudW1iZXI7XHJcbiAgYWx0aXR1ZGU6IG51bWJlcjtcclxuICB3ZW50dXJlUG9pbnRUaXRsZTogc3RyaW5nO1xyXG4gIHdlbnR1cmVQb2ludEluZm86IHN0cmluZztcclxuICBtYXJrZXJJc1NlbGVjdGVkOiBib29sZWFuO1xyXG4gIGlzQ2xvc2VFbm91Z2hUb0NvbGxlY3Q6IGJvb2xlYW47XHJcbiAgLy9pIHN0b3JlcyB0aGUgaW5kZXggdmFsdWUgb2YgbWVudVxyXG4gIHByaXZhdGUgX2k6IG51bWJlciA9IDBcclxuXHRnZXQgaSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2lcclxuXHR9XHJcbiAgLy90w6Row6RuIGthaWtraSBtaXTDpCBoYWx1dGFhbiB0YXBhaHR1dmFuIG1lbnVzdGFcclxuXHRzZXQgaShpOiBudW1iZXIpIHtcclxuXHRcdHRoaXMuX2kgPSBpXHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLmkpO1xyXG5cclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsIHByaXZhdGUgd2VudHVyZVBvaW50U2VydmljZTogV2VudHVyZVBvaW50U2VydmljZSwgcHJpdmF0ZSBwYWdlOiBQYWdlLCBwcml2YXRlIF9tb2RhbFNlcnZpY2U6IE1vZGFsRGlhbG9nU2VydmljZSwgcHJpdmF0ZSB2Y1JlZjogVmlld0NvbnRhaW5lclJlZikge1xyXG5cclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgLy8gVE9ETzogTG9hZGVyP1xyXG4gICAgLy8gVE9ETzogbWVudWl0ZW0gaWNvbml0IHB1dXR0dXUsIGFjdGlvbmJhcmluIG1haGQgcGlpbG90dGFtaW5lbig/KVxyXG4gICAgVG5zU2lkZURyYXdlci5idWlsZCh7XHJcbiAgICAgIHRlbXBsYXRlczogW3tcclxuICAgICAgICAgIHRpdGxlOiAnV2VudHVyZXBvaW50cycsXHJcbiAgICAgICAgICAvL2FuZHJvaWRJY29uOiAnaWNfaG9tZV93aGl0ZV8yNGRwJyxcclxuICAgICAgICAgIC8vaW9zSWNvbjogJ2ljX2hvbWVfd2hpdGUnLFxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgICB0aXRsZTogJ1JvdXRlcycsXHJcbiAgICAgICAgICAvL2FuZHJvaWRJY29uOiAnaWNfZ2F2ZWxfd2hpdGVfMjRkcCcsXHJcbiAgICAgICAgICAvL2lvc0ljb246ICdpY19nYXZlbF93aGl0ZScsXHJcbiAgICAgIH0sIHtcclxuICAgICAgICAgIHRpdGxlOiAnTXkgV2VudHVyZXMnLFxyXG4gICAgICAgICAgLy9hbmRyb2lkSWNvbjogJ2ljX2FjY291bnRfYmFsYW5jZV93aGl0ZV8yNGRwJyxcclxuICAgICAgICAgIC8vaW9zSWNvbjogJ2ljX2FjY291bnRfYmFsYW5jZV93aGl0ZScsXHJcbiAgICAgIH0sIHtcclxuICAgICAgICAgIHRpdGxlOiAnU2V0dGluZ3MnLFxyXG4gICAgICAgIC8vICBhbmRyb2lkSWNvbjogJ2ljX2J1aWxkX3doaXRlXzI0ZHAnLFxyXG4gICAgICAgIC8vICBpb3NJY29uOiAnaWNfYnVpbGRfd2hpdGUnLFxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgICB0aXRsZTogJ0xvZyBvdXQnLFxyXG4gICAgICAgIC8vICBhbmRyb2lkSWNvbjogJ2ljX2FjY291bnRfY2lyY2xlX3doaXRlXzI0ZHAnLFxyXG4gICAgICAgIC8vICBpb3NJY29uOiAnaWNfYWNjb3VudF9jaXJjbGVfd2hpdGUnLFxyXG4gICAgICB9XSxcclxuICAgICAgdGl0bGU6ICdXZW50dXJlJyxcclxuICAgICAgc3VidGl0bGU6ICd5b3VyIHVyYmFuIGFkdmVudHVyZSEnLFxyXG4gICAgICBsaXN0ZW5lcjogKGluZGV4KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmkgPSBpbmRleFxyXG4gICAgICB9LFxyXG4gICAgICBjb250ZXh0OiB0aGlzLFxyXG4gICAgfSk7XHJcblxyXG4gIH1cclxuXHJcbiAgdG9nZ2xlU2lkZURyYXdlcigpIHtcclxuICAgIFRuc1NpZGVEcmF3ZXIudG9nZ2xlKCk7XHJcblxyXG4gIH1cclxuXHJcblxyXG4gIGNyZWF0ZU1vZGVsVmlldyhtYXJrKSB7XHJcbiAgICBsZXQgdGhhdCA9IHRoaXM7XHJcbiAgICBsZXQgb3B0aW9uczogTW9kYWxEaWFsb2dPcHRpb25zID0ge1xyXG4gICAgICAgIHZpZXdDb250YWluZXJSZWY6IHRoaXMudmNSZWYsXHJcbiAgICAgICAgY29udGV4dDogXCJDb250ZXh0XCIsXHJcbiAgICAgICAgZnVsbHNjcmVlbjogdHJ1ZVxyXG4gICAgfTtcclxuICAgIC8vID4+IHJldHVybmluZy1yZXN1bHRcclxuICAgIHRoaXMuX21vZGFsU2VydmljZS5zaG93TW9kYWwoUHJpemVWaWV3Q29tcG9uZW50LCBvcHRpb25zKVxyXG4gICAgICAgIC50aGVuKCgvKiAqLykgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtYXJrLnRpdGxlKTtcclxuICAgICAgICAgICAgLy8gVE9ETzogVMOkc3PDpCBzaXR0ZW4gYXNldGV0YWFuIHNpaGVuIHByaXplLXZpZXdpaW4gbWFya2VyaW4gbmltaVxyXG4gICAgICAgIH0pO1xyXG4gICAgLy8gPDwgcmV0dXJuaW5nLXJlc3VsdFxyXG4gIH1cclxuXHJcbiAgY29sbGVjdEJ1dHRvblRhcHBlZCgpIHtcclxuICAgIC8vIFRPRE86IFTDpGjDpG4gc2Uga2Vyw6R5c3RvaW1pbnRvLCBpZiBkaXN0YW5jZSBqdG4sIG5paW4gdHVvbHRhIHRvaSBjb2xsZWN0KClcclxuICAgIC8vIFRoaXMgbWlnaHQgYmUgc3R1cGlkLCBidXQgd29ya3MgZm9yIG5vdyA6KVxyXG4gICAgLy9UT0RPOiBhZGRpbmcgY29sbGVjdGVkIG1hcmtlciB0byBhIGxpc3QgZXRjLiBiNCByZW1vdmluZ1xyXG5cclxuICAgICAgY29sbGVjdERpc3RhbmNlID0gNTA7XHJcbiAgICAgIGlmKGdldERpc3RhbmNlVG8oc2VsZWN0ZWRNYXJrZXIpIDwgY29sbGVjdERpc3RhbmNlKSB7XHJcbiAgICAgICAgbGV0IGFtb3VudCA9IGhvd01hbnlDb2xsZWN0ZWQoKTtcclxuICAgICAgICB0aGlzLmNvbGxlY3QoYW1vdW50LCBzZWxlY3RlZE1hcmtlcik7XHJcbiAgICAgICAgLy9hbGVydChcIlZlbnR1cmUgcG9pbnQgY29sbGVjdGVkLiBcXG5Db2xsZWN0ZWQ6IFwiICsgYW1vdW50KTtcclxuICAgICAgICBjb2xsZWN0ZWRNYXJrZXJzLnB1c2goc2VsZWN0ZWRNYXJrZXIpO1xyXG4gICAgICAgIG1hcFZpZXcucmVtb3ZlTWFya2VyKHNlbGVjdGVkTWFya2VyKTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiWW91IGhhdmUgXCIgKyBjb2xsZWN0ZWRNYXJrZXJzLmxlbmd0aCArIFwiIGNvbGxlY3RlZCBtYXJrZXJzLlwiKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiXFxuTWFya2VyIHRvbyBmYXIgYXdheSwgbW92ZSBjbG9zZXIuXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2coc2VsZWN0ZWRNYXJrZXIudGl0bGUpO1xyXG5cclxuICB9XHJcblxyXG4gIGNvbGxlY3QoYW1vdW50LCBtYXJrKSB7XHJcbiAgICB0aGlzLmNyZWF0ZU1vZGVsVmlldyhtYXJrKTtcclxuICAgIC8qZGlhbG9nc01vZHVsZS5hbGVydCh7XHJcbiAgICAgIG1lc3NhZ2U6IFwiV2VudHVyZSBwb2ludCBcIiArIG1hcmsudGl0bGUgKyBcIiBjb2xsZWN0ZWQhIFxcbllvdSBoYXZlOiBcIiArIGFtb3VudCxcclxuICAgICAgb2tCdXR0b25UZXh0OiBcIk9LXCJcclxuICAgIH0pOyovXHJcbiAgfVxyXG5cclxuICBhZGRXZW50dXJlUG9pbnRzKG1hcFZpZXcpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciB3UG9pbnQgPSB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkuZ2V0SXRlbShpKTtcclxuICAgICAgdmFyIG1hcmtlciA9IG5ldyBtYXBzTW9kdWxlLk1hcmtlcigpO1xyXG5cclxuICAgICAgbWFya2VyLnBvc2l0aW9uID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcod1BvaW50LmxhdCwgd1BvaW50LmxuZyk7XHJcbiAgICAgIG1hcmtlci50aXRsZSA9IHdQb2ludC50aXRsZTtcclxuICAgICAgbWFya2VyLnNuaXBwZXQgPSBcIlwiO1xyXG4gICAgICAvL0FuZHJvaWRpbGxhIHRvaW1paS4gSW9zaWxsZSBwaXTDpMOkIGthdHNvYSBtaXRlbiByZXNvdXJjZSB0b2ltaWkuIFBDOmxsw6QgZWkgcHlzdHl0w6QgdGVzdGFhbWFhblxyXG4gICAgICAvL0lrb25pYSBqb3V0dXUgaGllbW5hIG11b2trYWFtYWFuKHBpZW5lbW3DpGtzaSBqYSBsaXPDpHTDpMOkbiBwaWVuaSBvc29pdGluIGFsYWxhaXRhYW4pXHJcbiAgICAgIHZhciBpY29uID0gbmV3IEltYWdlKCk7XHJcbiAgICAgIGljb24uaW1hZ2VTb3VyY2UgPSBpbWFnZVNvdXJjZS5mcm9tUmVzb3VyY2UoJ2ljb24nKTtcclxuICAgICAgbWFya2VyLmljb24gPSBpY29uO1xyXG4gICAgICBtYXJrZXIuZHJhZ2dhYmxlID0gdHJ1ZTtcclxuICAgICAgbWFya2VyLnVzZXJEYXRhID0ge2luZGV4OiAxfTtcclxuICAgICAgbWFwVmlldy5hZGRNYXJrZXIobWFya2VyKTtcclxuXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL01hcCBldmVudHNcclxuICBvbk1hcFJlYWR5ID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIk1hcCBSZWFkeVwiKTtcclxuICAgIHN0YXJ0V2F0Y2goZXZlbnQpO1xyXG5cclxuICAgIC8vIENoZWNrIGlmIGxvY2F0aW9uIHNlcnZpY2VzIGFyZSBlbmFibGVkXHJcbiAgICBpZiAoIWdlb2xvY2F0aW9uLmlzRW5hYmxlZCgpKSB7XHJcbiAgICAgICAgZ2VvbG9jYXRpb24uZW5hYmxlTG9jYXRpb25SZXF1ZXN0KCk7XHJcbiAgICB9IGVsc2UgY29uc29sZS5sb2coXCJBbGxlcyBpbiBPcmRudW5nXCIpO1xyXG5cclxuICAgIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XHJcbiAgICB2YXIgZ01hcCA9IG1hcFZpZXcuZ01hcDtcclxuXHJcbiAgICB0aGlzLmFkZFdlbnR1cmVQb2ludHMobWFwVmlldyk7XHJcblxyXG4gIH07XHJcblxyXG4gIG9uQ29vcmRpbmF0ZVRhcHBlZCA9IChldmVudCkgPT4ge1xyXG4gICAgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcclxuICAgIHRoaXMud2VudHVyZVBvaW50VGl0bGUgPSBcIlwiO1xyXG4gICAgdGhpcy53ZW50dXJlUG9pbnRJbmZvID0gXCJcIjtcclxuICAgIGNvbnNvbGUubG9nKFwiQ29vcmRpbmF0ZSB0YXBwZWQuXCIpO1xyXG4gICAgdGhpcy5tYXJrZXJJc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgfTtcclxuXHJcbiAgb25Db29yZGluYXRlTG9uZ1ByZXNzID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIkxvbmdQcmVzc1wiKTtcclxuXHJcbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcclxuICAgIHZhciBsYXQgPSBldmVudC5wb3NpdGlvbi5sYXRpdHVkZTtcclxuICAgIHZhciBsbmcgPSBldmVudC5wb3NpdGlvbi5sb25naXR1ZGU7XHJcblxyXG4gICAgY29uc29sZS5sb2coXCJUYXBwZWQgbG9jYXRpb246IFxcblxcdExhdGl0dWRlOiBcIiArIGV2ZW50LnBvc2l0aW9uLmxhdGl0dWRlICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcblxcdExvbmdpdHVkZTogXCIgKyBldmVudC5wb3NpdGlvbi5sb25naXR1ZGUpO1xyXG5cclxuLyogIFTDpHTDpCB2b2kga8OkeXR0w6TDpCB0ZXN0YWlsdXVuLCBqb3MgaGFsdWFhIGxpc8OkdMOkIG1hcmtlcmVpdGEuXHJcbiAgICB2YXIgbWFya2VyID0gbmV3IG1hcHNNb2R1bGUuTWFya2VyKCk7XHJcbiAgICBtYXJrZXIucG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyhsYXQsIGxuZyk7XHJcbiAgICBtYXJrZXIudGl0bGUgPSBcIldlbnR1cmUgcG9pbnRcIjtcclxuICAgIG1hcmtlci5zbmlwcGV0ID0gXCJcIjtcclxuICAgIC8vQW5kcm9pZGlsbGEgdG9pbWlpLiBJb3NpbGxlIHBpdMOkw6Qga2F0c29hIG1pdGVuIHJlc291cmNlIHRvaW1paS4gUEM6bGzDpCBlaSBweXN0eXTDpCB0ZXN0YWFtYWFuXHJcbiAgICAvL0lrb25pYSBqb3V0dXUgaGllbW5hIG11b2trYWFtYWFuIHBpZW5lbW3DpGtzaSBqYSBsaXPDpHTDpMOkbiBwaWVuaSBvc29pdGluIGFsYWxhaXRhYW4pXHJcbiAgICB2YXIgaWNvbiA9IG5ldyBJbWFnZSgpO1xyXG4gICAgaWNvbi5pbWFnZVNvdXJjZSA9IGltYWdlU291cmNlLmZyb21SZXNvdXJjZSgnaWNvbicpO1xyXG4gICAgbWFya2VyLmljb24gPSBpY29uO1xyXG4gICAgbWFya2VyLmRyYWdnYWJsZSA9IHRydWU7XHJcbiAgICBtYXJrZXIudXNlckRhdGEgPSB7aW5kZXg6IDF9O1xyXG4gICAgbWFwVmlldy5hZGRNYXJrZXIobWFya2VyKTtcclxuICAqL1xyXG4gIH07XHJcblxyXG4gIC8vIFRPRE86IFTDpG3DpG4gdm9pc2kgc2lpcnTDpMOkIGpvaG9ua2luIGZpa3N1bXBhYW4gcGFpa2thYW4uXHJcbiAgVG5zU2lkZURyYXdlck9wdGlvbnNMaXN0ZW5lciA9IChpbmRleCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coaW5kZXgpXHJcbiAgfTtcclxuXHJcbiAgb25NYXJrZXJTZWxlY3QgPSAoZXZlbnQpID0+IHtcclxuXHJcbiAgICBpbnRlcmZhY2UgUG9zaXRpb25PYmplY3Qge1xyXG4gICAgICBcImxhdGl0dWRlXCI6IHN0cmluZyxcclxuICAgICAgXCJsb25naXR1ZGVcIjogc3RyaW5nXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XHJcblxyXG4gICAgbGV0IG1hcmtlclBvcyA9IEpTT04uc3RyaW5naWZ5KGV2ZW50Lm1hcmtlci5wb3NpdGlvbik7XHJcbiAgICBsZXQgY3VycmVudFBvcyA9IEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbik7XHJcbiAgICBsZXQgZGlzdGFuY2UgPSBnZXREaXN0YW5jZVRvKGV2ZW50Lm1hcmtlcik7XHJcblxyXG4gICAgLy8gTWFrZSBib3R0b20gYmFyIHZpc2libGVcclxuICAgIHRoaXMubWFya2VySXNTZWxlY3RlZCA9IHRydWU7XHJcblxyXG4gICAgLy8gQ2hhbmdlIHRoZSBjb250ZW50IG9mIHRoZSBib3R0b20gYmFyIHRleHRcclxuICAgIHRoaXMud2VudHVyZVBvaW50VGl0bGUgPSBldmVudC5tYXJrZXIudGl0bGU7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGV2ZW50Lm1hcmtlci50aXRsZSA9PT0gdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSkudGl0bGUpIHtcclxuICAgICAgICB0aGlzLndlbnR1cmVQb2ludEluZm8gPSB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkuZ2V0SXRlbShpKS5pbmZvO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiXFx0XCIgKyB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkuZ2V0SXRlbShpKS5pbmZvKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV2ZW50Lm1hcmtlci5zbmlwcGV0ID0gXCJEaXN0YW5jZTogXCIgKyBkaXN0YW5jZS50b0ZpeGVkKDApICsgXCIgbVwiO1xyXG4gICAgaWYgKGRpc3RhbmNlIDwgNTApIHtcclxuICAgICAgdGhpcy5pc0Nsb3NlRW5vdWdoVG9Db2xsZWN0ID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB0aGlzLmlzQ2xvc2VFbm91Z2hUb0NvbGxlY3QgPSBmYWxzZTtcclxuXHJcbiAgICBsZXQgY29sbGVjdEJ1dHRvbiA9IDxCdXR0b24+dGhpcy5jb2xsZWN0QnV0dG9uLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICBsZXQgY29sbGVjdEJ1dHRvbkNvbG9yID0gbmV3IENvbG9yKHRoaXMuaXNDbG9zZUVub3VnaFRvQ29sbGVjdCA/IFwiI0NCMUQwMFwiIDogXCIjNDg0ODQ4XCIpO1xyXG4gICAgY29sbGVjdEJ1dHRvbi5iYWNrZ3JvdW5kQ29sb3IgPSBjb2xsZWN0QnV0dG9uQ29sb3I7XHJcblxyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiXFxuXFx0TWFya2VyU2VsZWN0OiBcIiArIGV2ZW50Lm1hcmtlci50aXRsZVxyXG4gICAgICAgICAgICAgICAgICArIFwiXFxuXFx0TWFya2VyIHBvc2l0aW9uOiBcIiArIG1hcmtlclBvc1xyXG4gICAgICAgICAgICAgICAgICArIFwiXFxuXFx0Q3VycmVudCBwb3NpdGlvbjogXCIgKyBjdXJyZW50UG9zXHJcbiAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHREaXN0YW5jZSB0byBtYXJrZXI6IFwiICsgZGlzdGFuY2UudG9GaXhlZCgyKSArIFwibVwiKTtcclxuXHJcblxyXG4gICAgc2VsZWN0ZWRNYXJrZXIgPSBldmVudC5tYXJrZXI7XHJcblxyXG5cclxuXHJcbiAgfTtcclxuXHJcbiAgb25NYXJrZXJCZWdpbkRyYWdnaW5nID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckJlZ2luRHJhZ2dpbmdcIik7XHJcbiAgfTtcclxuXHJcbiAgb25NYXJrZXJFbmREcmFnZ2luZyA9IChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJFbmREcmFnZ2luZ1wiKTtcclxuICB9O1xyXG5cclxuICBvbk1hcmtlckRyYWcgPSAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyRHJhZ1wiKTtcclxuICB9O1xyXG5cclxuICBvbkNhbWVyYUNoYW5nZWQgPSAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwiQ2FtZXJhQ2hhbmdlXCIpO1xyXG4gICAgY29uc29sZS5sb2coXCJXZW50dXJlIFBvaW50czpcIik7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zb2xlLmxvZyhcIlxcdFwiICsgSlNPTi5zdHJpbmdpZnkodGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSkpKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBvblNoYXBlU2VsZWN0ID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIllvdXIgY3VycmVudCBwb3NpdGlvbiBpczogXCIgKyBKU09OLnN0cmluZ2lmeShjdXJyZW50UG9zaXRpb24pKTtcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRXYXRjaChldmVudCkge1xyXG5cclxuICBpbnRlcmZhY2UgTG9jYXRpb25PYmplY3Qge1xyXG4gICAgXCJsYXRpdHVkZVwiOiBudW1iZXIsXHJcbiAgICBcImxvbmdpdHVkZVwiOiBudW1iZXIsXHJcbiAgICBcImFsdGl0dWRlXCI6IG51bWJlcixcclxuICAgIFwiaG9yaXpvbnRhbEFjY3VyYWN5XCI6IG51bWJlcixcclxuICAgIFwidmVydGljYWxBY2N1cmFjeVwiOiBudW1iZXIsXHJcbiAgICBcInNwZWVkXCI6IG51bWJlcixcclxuICAgIFwiZGlyZWN0aW9uXCI6IG51bWJlcixcclxuICAgIFwidGltZXN0YW1wXCI6c3RyaW5nXHJcbiAgfVxyXG5cclxuICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcclxuICBjdXJyZW50UG9zQ2lyY2xlID0gbmV3IG1hcHNNb2R1bGUuQ2lyY2xlKCk7XHJcbiAgY3VycmVudFBvc0NpcmNsZS5jZW50ZXIgPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZygwLCAwKTtcclxuICBjdXJyZW50UG9zQ2lyY2xlLnZpc2libGUgPSB0cnVlO1xyXG4gIGN1cnJlbnRQb3NDaXJjbGUucmFkaXVzID0gMjA7XHJcbiAgY3VycmVudFBvc0NpcmNsZS5maWxsQ29sb3IgPSBuZXcgQ29sb3IoJyM2YzlkZjAnKTtcclxuICBjdXJyZW50UG9zQ2lyY2xlLnN0cm9rZUNvbG9yID0gbmV3IENvbG9yKCcjMzk2YWJkJyk7XHJcbiAgY3VycmVudFBvc0NpcmNsZS5zdHJva2V3aWR0aCA9IDI7XHJcbiAgY3VycmVudFBvc0NpcmNsZS5jbGlja2FibGUgPSB0cnVlO1xyXG4gIG1hcFZpZXcuYWRkQ2lyY2xlKGN1cnJlbnRQb3NDaXJjbGUpO1xyXG5cclxuICB3YXRjaElkID0gZ2VvbG9jYXRpb24ud2F0Y2hMb2NhdGlvbihcclxuICBmdW5jdGlvbiAobG9jKSB7XHJcbiAgICAgIGlmIChsb2MpIHtcclxuICAgICAgICAgIGxldCBvYmo6IExvY2F0aW9uT2JqZWN0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShsb2MpKTtcclxuICAgICAgICAgIHRoaXMubGF0aXR1ZGUgPSBvYmoubGF0aXR1ZGU7XHJcbiAgICAgICAgICB0aGlzLmxvbmdpdHVkZSA9IG9iai5sb25naXR1ZGU7XHJcbiAgICAgICAgICB0aGlzLmFsdGl0dWRlID0gb2JqLmFsdGl0dWRlO1xyXG4gICAgICAgICAgLyp2YXIqL2N1cnJlbnRQb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKG9iai5sYXRpdHVkZSwgb2JqLmxvbmdpdHVkZSk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhuZXcgRGF0ZSgpICsgXCJcXG5SZWNlaXZlZCBsb2NhdGlvbjpcXG5cXHRMYXRpdHVkZTogXCIgKyBvYmoubGF0aXR1ZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdExvbmdpdHVkZTogXCIgKyBvYmoubG9uZ2l0dWRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRBbHRpdHVkZTogXCIgKyBvYmouYWx0aXR1ZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdFRpbWVzdGFtcDogXCIgKyBvYmoudGltZXN0YW1wXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHREaXJlY3Rpb246IFwiICsgb2JqLmRpcmVjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFxuQ3VycmVudFBvczogXCIgKyBKU09OLnN0cmluZ2lmeShjdXJyZW50UG9zaXRpb24pKTtcclxuXHJcbiAgICAgICAgICBjdXJyZW50UG9zQ2lyY2xlLmNlbnRlciA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKHRoaXMubGF0aXR1ZGUsIHRoaXMubG9uZ2l0dWRlKTtcclxuXHJcbiAgICAgICAgICBtYXBWaWV3LmxhdGl0dWRlID0gdGhpcy5sYXRpdHVkZTtcclxuICAgICAgICAgIG1hcFZpZXcubG9uZ2l0dWRlID0gdGhpcy5sb25naXR1ZGU7XHJcbiAgICAgIH1cclxuICB9LFxyXG4gIGZ1bmN0aW9uKGUpe1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIGUubWVzc2FnZSk7XHJcbiAgfSxcclxuICB7ZGVzaXJlZEFjY3VyYWN5OiAzLCB1cGRhdGVEaXN0YW5jZTogMTAsIG1pbmltdW1VcGRhdGVUaW1lIDogMTAwMCAqIDJ9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVuZFdhdGNoKCkge1xyXG4gICAgaWYgKHdhdGNoSWQpIHtcclxuICAgICAgICBnZW9sb2NhdGlvbi5jbGVhcldhdGNoKHdhdGNoSWQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiTXkgd2F0Y2ggaXMgZW5kZWQuLi4gVC4gSm9uIFNub3dcIik7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIFRPRE86IHRvaW1pbWFhbiBhbmRyb2lkaWxsZSBrYW5zc2FcclxuZnVuY3Rpb24gZ2V0RGlzdGFuY2VUbyhvYmopIHtcclxuICBsZXQgb2JqUG9zID0gSlNPTi5zdHJpbmdpZnkob2JqLnBvc2l0aW9uKTtcclxuICBsZXQgY3VycmVudFBvcyA9IEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbik7XHJcbiAgbGV0IGRpc3RhbmNlID0gbnVsbDtcclxuXHJcbiAgaWYoaXNJT1MpIHtcclxuICAgIC8vY29uc29sZS5sb2coXCJSdW5uaW5nIG9uIGlvcy5cIilcclxuICAgIGRpc3RhbmNlID0gZ2VvbG9jYXRpb24uZGlzdGFuY2UoSlNPTi5wYXJzZShvYmpQb3MpLl9pb3MsIEpTT04ucGFyc2UoY3VycmVudFBvcykuX2lvcyk7XHJcbiAgfSBlbHNlIGlmKGlzQW5kcm9pZCkge1xyXG4gICAgY29uc29sZS5sb2coXCJSdW5uaW5nIG9uIGFuZHJvaWQuXCIpO1xyXG4gICAgZGlzdGFuY2UgPSAzOy8vZ2VvbG9jYXRpb24uZGlzdGFuY2UoSlNPTi5wYXJzZShvYmpQb3MpLl9hbmRyb2lkLCBKU09OLnBhcnNlKGN1cnJlbnRQb3MpLl9hbmRyb2lkKTtcclxuICB9IGVsc2Uge1xyXG4gICAgZGlzdGFuY2UgPSBcImVycm9yXCI7XHJcbiAgICBjb25zb2xlLmxvZyhcIkNvdWxkIG5vdCBmaW5kIGRpc3RhbmNlLlwiKTtcclxuICB9XHJcbiAgICByZXR1cm4gZGlzdGFuY2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhvd01hbnlDb2xsZWN0ZWQoKSB7XHJcbiAgcmV0dXJuIGNvbGxlY3RlZE1hcmtlcnMubGVuZ3RoICsgMTtcclxufVxyXG5cclxuLy9oYW5kbGVzIHRoZSBjb2xsZWN0aW9uIGFuZCByZXR1cm5zIG1lc3NhZ2VcclxuZnVuY3Rpb24gY29sbGVjdChhbW91bnQsIG1hcmspIHtcclxuICAvL2NyZWF0ZU1vZGVsVmlldygpO1xyXG4gIGRpYWxvZ3NNb2R1bGUuYWxlcnQoe1xyXG4gICAgbWVzc2FnZTogXCJXZW50dXJlIHBvaW50IFwiICsgbWFyay50aXRsZSArIFwiIGNvbGxlY3RlZCEgXFxuWW91IGhhdmU6IFwiICsgYW1vdW50LFxyXG4gICAgb2tCdXR0b25UZXh0OiBcIk9LXCJcclxuICB9KTtcclxufVxyXG4iXX0=