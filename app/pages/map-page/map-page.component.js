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
        this.TnsSideDrawerOptionsListener = function (index) {
            console.log(index);
        };
        //Map events
        this.onMapReady = function (event) {
            startWatch(event);
            // Check if location services are enabled
            if (!geolocation.isEnabled()) {
                geolocation.enableLocationRequest();
            }
            else
                console.log("Location services enabled.");
            mapView = event.object;
            var gMap = mapView.gMap;
            _this.addWenturePoints(mapView);
        };
        this.onCoordinateTapped = function (event) {
            mapView = event.object;
            _this.wenturePointTitle = "";
            _this.wenturePointInfo = "";
            _this.markerIsSelected = false;
        };
        this.onCoordinateLongPress = function (event) {
            var mapView = event.object;
            var lat = event.position.latitude;
            var lng = event.position.longitude;
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
                }
            }
            event.marker.snippet = "Distance: " + distance.toFixed(0) + " m";
            if (distance < 50) {
                _this.isCloseEnoughToCollect = true;
            }
            else
                _this.isCloseEnoughToCollect = false;
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
            //
        };
        this.onShapeSelect = function (event) {
            console.log("Shape selected.");
        };
        this.wenturePointService.populate();
    }
    Object.defineProperty(MapPageComponent.prototype, "i", {
        get: function () {
            return this._i;
        },
        //i saadaan menun sisäänrakennetusta kuuntelijasta
        set: function (i) {
            this._i = i;
            this.menuListener(i);
        },
        enumerable: true,
        configurable: true
    });
    // tähän menun toiminnallisuus
    MapPageComponent.prototype.menuListener = function (i) {
        console.log(i);
        if (i == 1) {
            alert("Routes are yet to come");
        }
        ;
        if (i == 4) {
            this.router.navigate(["/"]);
        }
        ;
    };
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
        var _this = this;
        var that = this;
        var options = {
            viewContainerRef: this.vcRef,
            context: mark,
            fullscreen: true
        };
        // >> returning-result
        this._modalService.showModal(prize_view_1.PrizeViewComponent, options)
            .then(function () {
            _this.markerIsSelected = false;
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
    };
    MapPageComponent.prototype.collect = function (amount, mark) {
        this.createModelView(mark);
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
            currentPosition = mapsModule.Position.positionFromLatLng(obj.latitude, obj.longitude);
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
    dialogsModule.alert({
        message: "Wenture point " + mark.title + " collected! \nYou have: " + amount,
        okButtonText: "OK"
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBMkY7QUFDM0YscUNBQTRDO0FBQzVDLDBFQUFzRTtBQUN0RSxrRUFBMkY7QUFDM0Ysc0RBQXdEO0FBQ3hELDBDQUF5QztBQUN6QyxnQ0FBK0I7QUFFL0IsK0JBQThCO0FBSTlCLHVGQUFxRjtBQUNyRixtRUFBd0Q7QUFFeEQsMkNBQWtEO0FBRWxELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ3pELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMxQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3RDLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUUxQyxJQUFJLE9BQVksQ0FBQztBQUNqQixJQUFJLGVBQXlCLENBQUM7QUFDOUIsSUFBSSxnQkFBcUIsQ0FBQztBQUMxQixJQUFJLGVBQXVCLENBQUMsQ0FBQyx1REFBdUQ7QUFDcEYsSUFBSSxPQUFZLENBQUM7QUFDakIsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDMUIsSUFBSSxjQUFjLENBQUM7QUFFbkIsa0NBQWUsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLE9BQU8sRUFBL0MsQ0FBK0MsQ0FBQyxDQUFDO0FBVWxGLElBQWEsZ0JBQWdCO0lBa0MzQiwwQkFBb0IsTUFBYyxFQUFVLG1CQUF3QyxFQUFVLElBQVUsRUFBVSxhQUFpQyxFQUFVLEtBQXVCO1FBQXBMLGlCQUVDO1FBRm1CLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQVUsU0FBSSxHQUFKLElBQUksQ0FBTTtR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QUM7SUFDakQsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBRXBCLEVBQUUsQ0FBQSxDQUFDLGdCQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ1QsZ0NBQWdDO1FBQ2hDLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEYsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUEsQ0FBQyxvQkFBUyxDQUFDLENBQUMsQ0FBQztRQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDbkMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFBLHFGQUFxRjtJQUNwRyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ0MsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNwQixDQUFDO0FBR0Q7SUFDRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQsNENBQTRDO0FBQzVDLGlCQUFpQixNQUFNLEVBQUUsSUFBSTtJQUMzQixhQUFhLENBQUMsS0FBSyxDQUFDO1FBQ2xCLE9BQU8sRUFBRSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLDBCQUEwQixHQUFHLE1BQU07UUFDNUUsWUFBWSxFQUFFLElBQUk7S0FDbkIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3Q2hpbGQsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgeyBpc0FuZHJvaWQsIGlzSU9TIH0gZnJvbSBcInBsYXRmb3JtXCI7XHJcbmltcG9ydCB7cmVnaXN0ZXJFbGVtZW50fSBmcm9tIFwibmF0aXZlc2NyaXB0LWFuZ3VsYXIvZWxlbWVudC1yZWdpc3RyeVwiO1xyXG5pbXBvcnQgeyBNb2RhbERpYWxvZ1NlcnZpY2UsIE1vZGFsRGlhbG9nT3B0aW9ucyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9tb2RhbC1kaWFsb2dcIjtcclxuaW1wb3J0ICogYXMgZ2VvbG9jYXRpb24gZnJvbSBcIm5hdGl2ZXNjcmlwdC1nZW9sb2NhdGlvblwiO1xyXG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tIFwiQGFuZ3VsYXIvcm91dGVyXCI7XHJcbmltcG9ydCB7IFBhZ2UgfSBmcm9tIFwidWkvcGFnZVwiO1xyXG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwidWkvYnV0dG9uXCI7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSBcImNvbG9yXCI7XHJcbi8vaW1wb3J0IHsgSW1hZ2UgfSBmcm9tIFwidWkvaW1hZ2VcIjtcclxuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tIFwiaW1hZ2Utc291cmNlXCI7XHJcbmltcG9ydCB7IFdlbnR1cmVQb2ludCB9IGZyb20gXCIuLi8uLi9zaGFyZWQvd2VudHVyZXBvaW50L3dlbnR1cmVwb2ludFwiO1xyXG5pbXBvcnQgeyBXZW50dXJlUG9pbnRTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uL3NoYXJlZC93ZW50dXJlcG9pbnQvd2VudHVyZXBvaW50LnNlcnZpY2VcIjtcclxuaW1wb3J0IHsgVG5zU2lkZURyYXdlciB9IGZyb20gJ25hdGl2ZXNjcmlwdC1zaWRlZHJhd2VyJztcclxuaW1wb3J0IHsgVG5zU2lkZURyYXdlck9wdGlvbnNMaXN0ZW5lciB9IGZyb20gJ25hdGl2ZXNjcmlwdC1zaWRlZHJhd2VyJztcclxuaW1wb3J0IHsgUHJpemVWaWV3Q29tcG9uZW50IH0gZnJvbSBcIi4vcHJpemUtdmlld1wiO1xyXG5cclxudmFyIG1hcHNNb2R1bGUgPSByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKTtcclxudmFyIGRpYWxvZ3NNb2R1bGUgPSByZXF1aXJlKFwidWkvZGlhbG9nc1wiKTtcclxudmFyIEltYWdlID0gcmVxdWlyZShcInVpL2ltYWdlXCIpLkltYWdlO1xyXG52YXIgaW1hZ2VTb3VyY2UgPSByZXF1aXJlKFwiaW1hZ2Utc291cmNlXCIpO1xyXG5cclxudmFyIHdhdGNoSWQ6IGFueTtcclxudmFyIGN1cnJlbnRQb3NpdGlvbjogTG9jYXRpb247XHJcbnZhciBjdXJyZW50UG9zQ2lyY2xlOiBhbnk7XHJcbnZhciBjb2xsZWN0RGlzdGFuY2U6IG51bWJlcjsgLy9kaXN0YW5jZSBpbiBtIG9uIGhvdyBjbG9zZSB0byBlbmFibGUgY29sbGVjdC1wcm9wZXJ0eVxyXG52YXIgbWFwVmlldzogYW55O1xyXG52YXIgY29sbGVjdGVkTWFya2VycyA9IFtdO1xyXG52YXIgc2VsZWN0ZWRNYXJrZXI7XHJcblxyXG5yZWdpc3RlckVsZW1lbnQoXCJNYXBWaWV3XCIsICgpID0+IHJlcXVpcmUoXCJuYXRpdmVzY3JpcHQtZ29vZ2xlLW1hcHMtc2RrXCIpLk1hcFZpZXcpO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6IFwibWFwLXBhZ2VcIixcclxuICBwcm92aWRlcnM6IFtXZW50dXJlUG9pbnRTZXJ2aWNlLCBNb2RhbERpYWxvZ1NlcnZpY2VdLFxyXG4gIHRlbXBsYXRlVXJsOiBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmh0bWxcIixcclxuICBzdHlsZVVybHM6IFtcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLWNvbW1vbi5jc3NcIiwgXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS5jc3NcIl1cclxufSlcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgTWFwUGFnZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XHJcbiAgQFZpZXdDaGlsZChcIk1hcFZpZXdcIikgbWFwVmlldzogRWxlbWVudFJlZjtcclxuICBAVmlld0NoaWxkKFwiY29sbGVjdEJ1dHRvblwiKSBjb2xsZWN0QnV0dG9uOiBFbGVtZW50UmVmO1xyXG5cclxuICBsYXRpdHVkZTogbnVtYmVyO1xyXG4gIGxvbmdpdHVkZTogbnVtYmVyO1xyXG4gIGFsdGl0dWRlOiBudW1iZXI7XHJcbiAgd2VudHVyZVBvaW50VGl0bGU6IHN0cmluZztcclxuICB3ZW50dXJlUG9pbnRJbmZvOiBzdHJpbmc7XHJcbiAgbWFya2VySXNTZWxlY3RlZDogYm9vbGVhbjtcclxuICBpc0Nsb3NlRW5vdWdoVG9Db2xsZWN0OiBib29sZWFuO1xyXG4gIC8vaSBzdG9yZXMgdGhlIGluZGV4IHZhbHVlIG9mIG1lbnVcclxuICBwcml2YXRlIF9pOiBudW1iZXIgPSAwO1xyXG5cdGdldCBpKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5faTtcclxuXHR9XHJcbiAgLy9pIHNhYWRhYW4gbWVudW4gc2lzw6TDpG5yYWtlbm5ldHVzdGEga3V1bnRlbGlqYXN0YVxyXG5cdHNldCBpKGk6IG51bWJlcikge1xyXG5cdFx0dGhpcy5faSA9IGk7XHJcbiAgICB0aGlzLm1lbnVMaXN0ZW5lcihpKTtcclxuXHJcbiAgfVxyXG4vLyB0w6Row6RuIG1lbnVuIHRvaW1pbm5hbGxpc3V1c1xyXG4gIG1lbnVMaXN0ZW5lcihpKSB7XHJcbiAgICBjb25zb2xlLmxvZyhpKTtcclxuICAgIGlmKGkgPT0gMSkge1xyXG4gICAgICBhbGVydChcIlJvdXRlcyBhcmUgeWV0IHRvIGNvbWVcIik7XHJcbiAgICB9O1xyXG5cclxuICAgIGlmKGkgPT0gNCkge1xyXG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFtcIi9cIl0pO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsIHByaXZhdGUgd2VudHVyZVBvaW50U2VydmljZTogV2VudHVyZVBvaW50U2VydmljZSwgcHJpdmF0ZSBwYWdlOiBQYWdlLCBwcml2YXRlIF9tb2RhbFNlcnZpY2U6IE1vZGFsRGlhbG9nU2VydmljZSwgcHJpdmF0ZSB2Y1JlZjogVmlld0NvbnRhaW5lclJlZikge1xyXG4gICAgdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLnBvcHVsYXRlKCk7XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuICAgIC8vIFRPRE86IExvYWRlcj9cclxuICAgIC8vIFRPRE86IG1lbnVpdGVtIGljb25pdCBwdXV0dHV1LCBhY3Rpb25iYXJpbiBtYWhkIHBpaWxvdHRhbWluZW4oPylcclxuICAgIFRuc1NpZGVEcmF3ZXIuYnVpbGQoe1xyXG4gICAgICB0ZW1wbGF0ZXM6IFt7XHJcbiAgICAgICAgICB0aXRsZTogJ1dlbnR1cmVwb2ludHMnLFxyXG4gICAgICAgICAgLy9hbmRyb2lkSWNvbjogJ2ljX2hvbWVfd2hpdGVfMjRkcCcsXHJcbiAgICAgICAgICAvL2lvc0ljb246ICdpY19ob21lX3doaXRlJyxcclxuICAgICAgfSwge1xyXG4gICAgICAgICAgdGl0bGU6ICdSb3V0ZXMnLFxyXG4gICAgICAgICAgLy9hbmRyb2lkSWNvbjogJ2ljX2dhdmVsX3doaXRlXzI0ZHAnLFxyXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfZ2F2ZWxfd2hpdGUnLFxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgICB0aXRsZTogJ015IFdlbnR1cmVzJyxcclxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19hY2NvdW50X2JhbGFuY2Vfd2hpdGVfMjRkcCcsXHJcbiAgICAgICAgICAvL2lvc0ljb246ICdpY19hY2NvdW50X2JhbGFuY2Vfd2hpdGUnLFxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgICB0aXRsZTogJ1NldHRpbmdzJyxcclxuICAgICAgICAvLyAgYW5kcm9pZEljb246ICdpY19idWlsZF93aGl0ZV8yNGRwJyxcclxuICAgICAgICAvLyAgaW9zSWNvbjogJ2ljX2J1aWxkX3doaXRlJyxcclxuICAgICAgfSwge1xyXG4gICAgICAgICAgdGl0bGU6ICdMb2cgb3V0JyxcclxuICAgICAgICAvLyAgYW5kcm9pZEljb246ICdpY19hY2NvdW50X2NpcmNsZV93aGl0ZV8yNGRwJyxcclxuICAgICAgICAvLyAgaW9zSWNvbjogJ2ljX2FjY291bnRfY2lyY2xlX3doaXRlJyxcclxuICAgICAgfV0sXHJcbiAgICAgIHRpdGxlOiAnV2VudHVyZScsXHJcbiAgICAgIHN1YnRpdGxlOiAneW91ciB1cmJhbiBhZHZlbnR1cmUhJyxcclxuICAgICAgbGlzdGVuZXI6IChpbmRleCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5pID0gaW5kZXhcclxuICAgICAgfSxcclxuICAgICAgY29udGV4dDogdGhpcyxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgVG5zU2lkZURyYXdlck9wdGlvbnNMaXN0ZW5lciA9IChpbmRleCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coaW5kZXgpXHJcbiAgfTtcclxuXHJcbiAgdG9nZ2xlU2lkZURyYXdlcigpIHtcclxuICAgIFRuc1NpZGVEcmF3ZXIudG9nZ2xlKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgY3JlYXRlTW9kZWxWaWV3KG1hcmspIHtcclxuICAgIGxldCB0aGF0ID0gdGhpcztcclxuICAgIGxldCBvcHRpb25zOiBNb2RhbERpYWxvZ09wdGlvbnMgPSB7XHJcbiAgICAgICAgdmlld0NvbnRhaW5lclJlZjogdGhpcy52Y1JlZixcclxuICAgICAgICBjb250ZXh0OiBtYXJrLFxyXG4gICAgICAgIGZ1bGxzY3JlZW46IHRydWVcclxuICAgIH07XHJcbiAgICAvLyA+PiByZXR1cm5pbmctcmVzdWx0XHJcbiAgICB0aGlzLl9tb2RhbFNlcnZpY2Uuc2hvd01vZGFsKFByaXplVmlld0NvbXBvbmVudCwgb3B0aW9ucylcclxuICAgICAgICAudGhlbigoLyogKi8pID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tYXJrZXJJc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICAvLyA8PCByZXR1cm5pbmctcmVzdWx0XHJcbiAgfVxyXG5cclxuICBjb2xsZWN0QnV0dG9uVGFwcGVkKCkge1xyXG4gICAgLy8gVE9ETzogVMOkaMOkbiBzZSBrZXLDpHlzdG9pbWludG8sIGlmIGRpc3RhbmNlIGp0biwgbmlpbiB0dW9sdGEgdG9pIGNvbGxlY3QoKVxyXG4gICAgLy8gVGhpcyBtaWdodCBiZSBzdHVwaWQsIGJ1dCB3b3JrcyBmb3Igbm93IDopXHJcbiAgICAvL1RPRE86IGFkZGluZyBjb2xsZWN0ZWQgbWFya2VyIHRvIGEgbGlzdCBldGMuIGI0IHJlbW92aW5nXHJcblxyXG4gICAgICBjb2xsZWN0RGlzdGFuY2UgPSA1MDtcclxuICAgICAgaWYoZ2V0RGlzdGFuY2VUbyhzZWxlY3RlZE1hcmtlcikgPCBjb2xsZWN0RGlzdGFuY2UpIHtcclxuICAgICAgICBsZXQgYW1vdW50ID0gaG93TWFueUNvbGxlY3RlZCgpO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdChhbW91bnQsIHNlbGVjdGVkTWFya2VyKTtcclxuICAgICAgICAvL2FsZXJ0KFwiVmVudHVyZSBwb2ludCBjb2xsZWN0ZWQuIFxcbkNvbGxlY3RlZDogXCIgKyBhbW91bnQpO1xyXG4gICAgICAgIGNvbGxlY3RlZE1hcmtlcnMucHVzaChzZWxlY3RlZE1hcmtlcik7XHJcbiAgICAgICAgbWFwVmlldy5yZW1vdmVNYXJrZXIoc2VsZWN0ZWRNYXJrZXIpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJZb3UgaGF2ZSBcIiArIGNvbGxlY3RlZE1hcmtlcnMubGVuZ3RoICsgXCIgY29sbGVjdGVkIG1hcmtlcnMuXCIpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJcXG5NYXJrZXIgdG9vIGZhciBhd2F5LCBtb3ZlIGNsb3Nlci5cIik7XHJcbiAgICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBjb2xsZWN0KGFtb3VudCwgbWFyaykge1xyXG4gICAgdGhpcy5jcmVhdGVNb2RlbFZpZXcobWFyayk7XHJcbiAgfVxyXG5cclxuICBhZGRXZW50dXJlUG9pbnRzKG1hcFZpZXcpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciB3UG9pbnQgPSB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkuZ2V0SXRlbShpKTtcclxuICAgICAgdmFyIG1hcmtlciA9IG5ldyBtYXBzTW9kdWxlLk1hcmtlcigpO1xyXG5cclxuICAgICAgbWFya2VyLnBvc2l0aW9uID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcod1BvaW50LmxhdCwgd1BvaW50LmxuZyk7XHJcbiAgICAgIG1hcmtlci50aXRsZSA9IHdQb2ludC50aXRsZTtcclxuICAgICAgbWFya2VyLnNuaXBwZXQgPSBcIlwiO1xyXG4gICAgICAvL0FuZHJvaWRpbGxhIHRvaW1paS4gSW9zaWxsZSBwaXTDpMOkIGthdHNvYSBtaXRlbiByZXNvdXJjZSB0b2ltaWkuIFBDOmxsw6QgZWkgcHlzdHl0w6QgdGVzdGFhbWFhblxyXG4gICAgICAvL0lrb25pYSBqb3V0dXUgaGllbW5hIG11b2trYWFtYWFuKHBpZW5lbW3DpGtzaSBqYSBsaXPDpHTDpMOkbiBwaWVuaSBvc29pdGluIGFsYWxhaXRhYW4pXHJcbiAgICAgIHZhciBpY29uID0gbmV3IEltYWdlKCk7XHJcbiAgICAgIGljb24uaW1hZ2VTb3VyY2UgPSBpbWFnZVNvdXJjZS5mcm9tUmVzb3VyY2UoJ2ljb24nKTtcclxuICAgICAgbWFya2VyLmljb24gPSBpY29uO1xyXG4gICAgICBtYXJrZXIuZHJhZ2dhYmxlID0gdHJ1ZTtcclxuICAgICAgbWFya2VyLnVzZXJEYXRhID0ge2luZGV4OiAxfTtcclxuICAgICAgbWFwVmlldy5hZGRNYXJrZXIobWFya2VyKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vTWFwIGV2ZW50c1xyXG4gIG9uTWFwUmVhZHkgPSAoZXZlbnQpID0+IHtcclxuICAgIHN0YXJ0V2F0Y2goZXZlbnQpO1xyXG5cclxuICAgIC8vIENoZWNrIGlmIGxvY2F0aW9uIHNlcnZpY2VzIGFyZSBlbmFibGVkXHJcbiAgICBpZiAoIWdlb2xvY2F0aW9uLmlzRW5hYmxlZCgpKSB7XHJcbiAgICAgICAgZ2VvbG9jYXRpb24uZW5hYmxlTG9jYXRpb25SZXF1ZXN0KCk7XHJcbiAgICB9IGVsc2UgY29uc29sZS5sb2coXCJMb2NhdGlvbiBzZXJ2aWNlcyBlbmFibGVkLlwiKTtcclxuXHJcbiAgICBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xyXG4gICAgdmFyIGdNYXAgPSBtYXBWaWV3LmdNYXA7XHJcblxyXG4gICAgdGhpcy5hZGRXZW50dXJlUG9pbnRzKG1hcFZpZXcpO1xyXG5cclxuICB9O1xyXG5cclxuICBvbkNvb3JkaW5hdGVUYXBwZWQgPSAoZXZlbnQpID0+IHtcclxuICAgIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XHJcbiAgICB0aGlzLndlbnR1cmVQb2ludFRpdGxlID0gXCJcIjtcclxuICAgIHRoaXMud2VudHVyZVBvaW50SW5mbyA9IFwiXCI7XHJcbiAgICB0aGlzLm1hcmtlcklzU2VsZWN0ZWQgPSBmYWxzZTtcclxuICB9O1xyXG5cclxuICBvbkNvb3JkaW5hdGVMb25nUHJlc3MgPSAoZXZlbnQpID0+IHtcclxuICAgIHZhciBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xyXG4gICAgdmFyIGxhdCA9IGV2ZW50LnBvc2l0aW9uLmxhdGl0dWRlO1xyXG4gICAgdmFyIGxuZyA9IGV2ZW50LnBvc2l0aW9uLmxvbmdpdHVkZTtcclxuICB9O1xyXG5cclxuICBvbk1hcmtlclNlbGVjdCA9IChldmVudCkgPT4ge1xyXG5cclxuICAgIGludGVyZmFjZSBQb3NpdGlvbk9iamVjdCB7XHJcbiAgICAgIFwibGF0aXR1ZGVcIjogc3RyaW5nLFxyXG4gICAgICBcImxvbmdpdHVkZVwiOiBzdHJpbmdcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcclxuXHJcbiAgICBsZXQgbWFya2VyUG9zID0gSlNPTi5zdHJpbmdpZnkoZXZlbnQubWFya2VyLnBvc2l0aW9uKTtcclxuICAgIGxldCBjdXJyZW50UG9zID0gSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKTtcclxuICAgIGxldCBkaXN0YW5jZSA9IGdldERpc3RhbmNlVG8oZXZlbnQubWFya2VyKTtcclxuXHJcbiAgICAvLyBNYWtlIGJvdHRvbSBiYXIgdmlzaWJsZVxyXG4gICAgdGhpcy5tYXJrZXJJc1NlbGVjdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBDaGFuZ2UgdGhlIGNvbnRlbnQgb2YgdGhlIGJvdHRvbSBiYXIgdGV4dFxyXG4gICAgdGhpcy53ZW50dXJlUG9pbnRUaXRsZSA9IGV2ZW50Lm1hcmtlci50aXRsZTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoZXZlbnQubWFya2VyLnRpdGxlID09PSB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkuZ2V0SXRlbShpKS50aXRsZSkge1xyXG4gICAgICAgIHRoaXMud2VudHVyZVBvaW50SW5mbyA9IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpLmluZm87XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBldmVudC5tYXJrZXIuc25pcHBldCA9IFwiRGlzdGFuY2U6IFwiICsgZGlzdGFuY2UudG9GaXhlZCgwKSArIFwiIG1cIjtcclxuICAgIGlmIChkaXN0YW5jZSA8IDUwKSB7XHJcbiAgICAgIHRoaXMuaXNDbG9zZUVub3VnaFRvQ29sbGVjdCA9IHRydWU7XHJcbiAgICB9IGVsc2UgdGhpcy5pc0Nsb3NlRW5vdWdoVG9Db2xsZWN0ID0gZmFsc2U7XHJcblxyXG4gICAgc2VsZWN0ZWRNYXJrZXIgPSBldmVudC5tYXJrZXI7XHJcblxyXG4gIH07XHJcblxyXG4gIG9uTWFya2VyQmVnaW5EcmFnZ2luZyA9IChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJCZWdpbkRyYWdnaW5nXCIpO1xyXG4gIH07XHJcblxyXG4gIG9uTWFya2VyRW5kRHJhZ2dpbmcgPSAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyRW5kRHJhZ2dpbmdcIik7XHJcbiAgfTtcclxuXHJcbiAgb25NYXJrZXJEcmFnID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckRyYWdcIik7XHJcbiAgfTtcclxuXHJcbiAgb25DYW1lcmFDaGFuZ2VkID0gKGV2ZW50KSA9PiB7XHJcbiAgICAvL1xyXG4gIH07XHJcblxyXG4gIG9uU2hhcGVTZWxlY3QgPSAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwiU2hhcGUgc2VsZWN0ZWQuXCIpO1xyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzdGFydFdhdGNoKGV2ZW50KSB7XHJcblxyXG4gIGludGVyZmFjZSBMb2NhdGlvbk9iamVjdCB7XHJcbiAgICBcImxhdGl0dWRlXCI6IG51bWJlcixcclxuICAgIFwibG9uZ2l0dWRlXCI6IG51bWJlcixcclxuICAgIFwiYWx0aXR1ZGVcIjogbnVtYmVyLFxyXG4gICAgXCJob3Jpem9udGFsQWNjdXJhY3lcIjogbnVtYmVyLFxyXG4gICAgXCJ2ZXJ0aWNhbEFjY3VyYWN5XCI6IG51bWJlcixcclxuICAgIFwic3BlZWRcIjogbnVtYmVyLFxyXG4gICAgXCJkaXJlY3Rpb25cIjogbnVtYmVyLFxyXG4gICAgXCJ0aW1lc3RhbXBcIjpzdHJpbmdcclxuICB9XHJcblxyXG4gIHZhciBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xyXG4gIGN1cnJlbnRQb3NDaXJjbGUgPSBuZXcgbWFwc01vZHVsZS5DaXJjbGUoKTtcclxuICBjdXJyZW50UG9zQ2lyY2xlLmNlbnRlciA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKDAsIDApO1xyXG4gIGN1cnJlbnRQb3NDaXJjbGUudmlzaWJsZSA9IHRydWU7XHJcbiAgY3VycmVudFBvc0NpcmNsZS5yYWRpdXMgPSAyMDtcclxuICBjdXJyZW50UG9zQ2lyY2xlLmZpbGxDb2xvciA9IG5ldyBDb2xvcignIzZjOWRmMCcpO1xyXG4gIGN1cnJlbnRQb3NDaXJjbGUuc3Ryb2tlQ29sb3IgPSBuZXcgQ29sb3IoJyMzOTZhYmQnKTtcclxuICBjdXJyZW50UG9zQ2lyY2xlLnN0cm9rZXdpZHRoID0gMjtcclxuICBjdXJyZW50UG9zQ2lyY2xlLmNsaWNrYWJsZSA9IHRydWU7XHJcbiAgbWFwVmlldy5hZGRDaXJjbGUoY3VycmVudFBvc0NpcmNsZSk7XHJcblxyXG4gIHdhdGNoSWQgPSBnZW9sb2NhdGlvbi53YXRjaExvY2F0aW9uKFxyXG4gIGZ1bmN0aW9uIChsb2MpIHtcclxuICAgICAgaWYgKGxvYykge1xyXG4gICAgICAgICAgbGV0IG9iajogTG9jYXRpb25PYmplY3QgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGxvYykpO1xyXG4gICAgICAgICAgdGhpcy5sYXRpdHVkZSA9IG9iai5sYXRpdHVkZTtcclxuICAgICAgICAgIHRoaXMubG9uZ2l0dWRlID0gb2JqLmxvbmdpdHVkZTtcclxuICAgICAgICAgIHRoaXMuYWx0aXR1ZGUgPSBvYmouYWx0aXR1ZGU7XHJcbiAgICAgICAgICBjdXJyZW50UG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyhvYmoubGF0aXR1ZGUsIG9iai5sb25naXR1ZGUpO1xyXG5cclxuICAgICAgICAgIGN1cnJlbnRQb3NDaXJjbGUuY2VudGVyID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcodGhpcy5sYXRpdHVkZSwgdGhpcy5sb25naXR1ZGUpO1xyXG5cclxuICAgICAgICAgIG1hcFZpZXcubGF0aXR1ZGUgPSB0aGlzLmxhdGl0dWRlO1xyXG4gICAgICAgICAgbWFwVmlldy5sb25naXR1ZGUgPSB0aGlzLmxvbmdpdHVkZTtcclxuICAgICAgfVxyXG4gIH0sXHJcbiAgZnVuY3Rpb24oZSl7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgZS5tZXNzYWdlKTtcclxuICB9LFxyXG4gIHtkZXNpcmVkQWNjdXJhY3k6IDMsIHVwZGF0ZURpc3RhbmNlOiAxMCwgbWluaW11bVVwZGF0ZVRpbWUgOiAxMDAwICogMn0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZW5kV2F0Y2goKSB7XHJcbiAgICBpZiAod2F0Y2hJZCkge1xyXG4gICAgICAgIGdlb2xvY2F0aW9uLmNsZWFyV2F0Y2god2F0Y2hJZCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJNeSB3YXRjaCBpcyBlbmRlZC4uLiBULiBKb24gU25vd1wiKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gVE9ETzogdG9pbWltYWFuIGFuZHJvaWRpbGxlIGthbnNzYVxyXG5mdW5jdGlvbiBnZXREaXN0YW5jZVRvKG9iaikge1xyXG4gIGxldCBvYmpQb3MgPSBKU09OLnN0cmluZ2lmeShvYmoucG9zaXRpb24pO1xyXG4gIGxldCBjdXJyZW50UG9zID0gSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKTtcclxuICBsZXQgZGlzdGFuY2UgPSBudWxsO1xyXG5cclxuICBpZihpc0lPUykge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcIlJ1bm5pbmcgb24gaW9zLlwiKVxyXG4gICAgZGlzdGFuY2UgPSBnZW9sb2NhdGlvbi5kaXN0YW5jZShKU09OLnBhcnNlKG9ialBvcykuX2lvcywgSlNPTi5wYXJzZShjdXJyZW50UG9zKS5faW9zKTtcclxuICB9IGVsc2UgaWYoaXNBbmRyb2lkKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIlJ1bm5pbmcgb24gYW5kcm9pZC5cIik7XHJcbiAgICBkaXN0YW5jZSA9IDM7Ly9nZW9sb2NhdGlvbi5kaXN0YW5jZShKU09OLnBhcnNlKG9ialBvcykuX2FuZHJvaWQsIEpTT04ucGFyc2UoY3VycmVudFBvcykuX2FuZHJvaWQpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBkaXN0YW5jZSA9IFwiZXJyb3JcIjtcclxuICAgIGNvbnNvbGUubG9nKFwiQ291bGQgbm90IGZpbmQgZGlzdGFuY2UuXCIpO1xyXG4gIH1cclxuICAgIHJldHVybiBkaXN0YW5jZTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGhvd01hbnlDb2xsZWN0ZWQoKSB7XHJcbiAgcmV0dXJuIGNvbGxlY3RlZE1hcmtlcnMubGVuZ3RoICsgMTtcclxufVxyXG5cclxuLy9oYW5kbGVzIHRoZSBjb2xsZWN0aW9uIGFuZCByZXR1cm5zIG1lc3NhZ2VcclxuZnVuY3Rpb24gY29sbGVjdChhbW91bnQsIG1hcmspIHtcclxuICBkaWFsb2dzTW9kdWxlLmFsZXJ0KHtcclxuICAgIG1lc3NhZ2U6IFwiV2VudHVyZSBwb2ludCBcIiArIG1hcmsudGl0bGUgKyBcIiBjb2xsZWN0ZWQhIFxcbllvdSBoYXZlOiBcIiArIGFtb3VudCxcclxuICAgIG9rQnV0dG9uVGV4dDogXCJPS1wiXHJcbiAgfSk7XHJcbn1cclxuIl19