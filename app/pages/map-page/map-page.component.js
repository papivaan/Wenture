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
        //tähän kaikki mitä halutaan tapahtuvan menusta
        set: function (i) {
            this._i = i;
            this.menuListener(i);
        },
        enumerable: true,
        configurable: true
    });
    MapPageComponent.prototype.menuListener = function (i) {
        console.log(i);
        if (i == 1) {
            alert("Not in use");
        }
        ;
        if (i == 4) {
            alert("Logging out");
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
        var that = this;
        var options = {
            viewContainerRef: this.vcRef,
            context: mark,
            fullscreen: true
        };
        // >> returning-result
        this._modalService.showModal(prize_view_1.PrizeViewComponent, options)
            .then(function () {
            console.log(mark.title);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBMkY7QUFDM0YscUNBQTRDO0FBQzVDLDBFQUFzRTtBQUN0RSxrRUFBMkY7QUFDM0Ysc0RBQXdEO0FBQ3hELDBDQUF5QztBQUN6QyxnQ0FBK0I7QUFFL0IsK0JBQThCO0FBSTlCLHVGQUFxRjtBQUNyRixtRUFBd0Q7QUFFeEQsMkNBQWtEO0FBRWxELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ3pELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMxQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3RDLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUUxQyxJQUFJLE9BQVksQ0FBQztBQUNqQixJQUFJLGVBQXlCLENBQUM7QUFDOUIsSUFBSSxnQkFBcUIsQ0FBQztBQUMxQixJQUFJLGVBQXVCLENBQUMsQ0FBQyx1REFBdUQ7QUFDcEYsSUFBSSxPQUFZLENBQUM7QUFDakIsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDMUIsSUFBSSxjQUFjLENBQUM7QUFFbkIsa0NBQWUsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLE9BQU8sRUFBL0MsQ0FBK0MsQ0FBQyxDQUFDO0FBVWxGLElBQWEsZ0JBQWdCO0lBa0MzQiwwQkFBb0IsTUFBYyxFQUFVLG1CQUF3QyxFQUFVLElBQVUsRUFBVSxhQUFpQyxFQUFVLEtBQXVCO1FBQXBMLGlCQUVDO1FBRm1CLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQVUsU0FBSSxHQUFKLElBQUksQ0FBTTtR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RSxDQUFBLENBQUMsZ0JBQUssQ0FBQyxDQUFDLENBQUM7UUFDVCxnQ0FBZ0M7UUFDaEMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQSxDQUFDLG9CQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNuQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUEscUZBQXFGO0lBQ3BHLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFDQyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFHRDtJQUNFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFFRCw0Q0FBNEM7QUFDNUMsaUJBQWlCLE1BQU0sRUFBRSxJQUFJO0lBQzNCLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDbEIsT0FBTyxFQUFFLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsMEJBQTBCLEdBQUcsTUFBTTtRQUM1RSxZQUFZLEVBQUUsSUFBSTtLQUNuQixDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBPbkluaXQsIFZpZXdDaGlsZCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IGlzQW5kcm9pZCwgaXNJT1MgfSBmcm9tIFwicGxhdGZvcm1cIjtcclxuaW1wb3J0IHtyZWdpc3RlckVsZW1lbnR9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9lbGVtZW50LXJlZ2lzdHJ5XCI7XHJcbmltcG9ydCB7IE1vZGFsRGlhbG9nU2VydmljZSwgTW9kYWxEaWFsb2dPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL21vZGFsLWRpYWxvZ1wiO1xyXG5pbXBvcnQgKiBhcyBnZW9sb2NhdGlvbiBmcm9tIFwibmF0aXZlc2NyaXB0LWdlb2xvY2F0aW9uXCI7XHJcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcclxuaW1wb3J0IHsgUGFnZSB9IGZyb20gXCJ1aS9wYWdlXCI7XHJcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gXCJ1aS9idXR0b25cIjtcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tIFwiY29sb3JcIjtcclxuLy9pbXBvcnQgeyBJbWFnZSB9IGZyb20gXCJ1aS9pbWFnZVwiO1xyXG5pbXBvcnQgeyBJbWFnZVNvdXJjZSB9IGZyb20gXCJpbWFnZS1zb3VyY2VcIjtcclxuaW1wb3J0IHsgV2VudHVyZVBvaW50IH0gZnJvbSBcIi4uLy4uL3NoYXJlZC93ZW50dXJlcG9pbnQvd2VudHVyZXBvaW50XCI7XHJcbmltcG9ydCB7IFdlbnR1cmVQb2ludFNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3dlbnR1cmVwb2ludC93ZW50dXJlcG9pbnQuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBUbnNTaWRlRHJhd2VyIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXNpZGVkcmF3ZXInO1xyXG5pbXBvcnQgeyBUbnNTaWRlRHJhd2VyT3B0aW9uc0xpc3RlbmVyIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXNpZGVkcmF3ZXInO1xyXG5pbXBvcnQgeyBQcml6ZVZpZXdDb21wb25lbnQgfSBmcm9tIFwiLi9wcml6ZS12aWV3XCI7XHJcblxyXG52YXIgbWFwc01vZHVsZSA9IHJlcXVpcmUoXCJuYXRpdmVzY3JpcHQtZ29vZ2xlLW1hcHMtc2RrXCIpO1xyXG52YXIgZGlhbG9nc01vZHVsZSA9IHJlcXVpcmUoXCJ1aS9kaWFsb2dzXCIpO1xyXG52YXIgSW1hZ2UgPSByZXF1aXJlKFwidWkvaW1hZ2VcIikuSW1hZ2U7XHJcbnZhciBpbWFnZVNvdXJjZSA9IHJlcXVpcmUoXCJpbWFnZS1zb3VyY2VcIik7XHJcblxyXG52YXIgd2F0Y2hJZDogYW55O1xyXG52YXIgY3VycmVudFBvc2l0aW9uOiBMb2NhdGlvbjtcclxudmFyIGN1cnJlbnRQb3NDaXJjbGU6IGFueTtcclxudmFyIGNvbGxlY3REaXN0YW5jZTogbnVtYmVyOyAvL2Rpc3RhbmNlIGluIG0gb24gaG93IGNsb3NlIHRvIGVuYWJsZSBjb2xsZWN0LXByb3BlcnR5XHJcbnZhciBtYXBWaWV3OiBhbnk7XHJcbnZhciBjb2xsZWN0ZWRNYXJrZXJzID0gW107XHJcbnZhciBzZWxlY3RlZE1hcmtlcjtcclxuXHJcbnJlZ2lzdGVyRWxlbWVudChcIk1hcFZpZXdcIiwgKCkgPT4gcmVxdWlyZShcIm5hdGl2ZXNjcmlwdC1nb29nbGUtbWFwcy1zZGtcIikuTWFwVmlldyk7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogXCJtYXAtcGFnZVwiLFxyXG4gIHByb3ZpZGVyczogW1dlbnR1cmVQb2ludFNlcnZpY2UsIE1vZGFsRGlhbG9nU2VydmljZV0sXHJcbiAgdGVtcGxhdGVVcmw6IFwicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UuaHRtbFwiLFxyXG4gIHN0eWxlVXJsczogW1wicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UtY29tbW9uLmNzc1wiLCBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmNzc1wiXVxyXG59KVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBNYXBQYWdlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcclxuICBAVmlld0NoaWxkKFwiTWFwVmlld1wiKSBtYXBWaWV3OiBFbGVtZW50UmVmO1xyXG4gIEBWaWV3Q2hpbGQoXCJjb2xsZWN0QnV0dG9uXCIpIGNvbGxlY3RCdXR0b246IEVsZW1lbnRSZWY7XHJcblxyXG4gIGxhdGl0dWRlOiBudW1iZXI7XHJcbiAgbG9uZ2l0dWRlOiBudW1iZXI7XHJcbiAgYWx0aXR1ZGU6IG51bWJlcjtcclxuICB3ZW50dXJlUG9pbnRUaXRsZTogc3RyaW5nO1xyXG4gIHdlbnR1cmVQb2ludEluZm86IHN0cmluZztcclxuICBtYXJrZXJJc1NlbGVjdGVkOiBib29sZWFuO1xyXG4gIGlzQ2xvc2VFbm91Z2hUb0NvbGxlY3Q6IGJvb2xlYW47XHJcbiAgLy9pIHN0b3JlcyB0aGUgaW5kZXggdmFsdWUgb2YgbWVudVxyXG4gIHByaXZhdGUgX2k6IG51bWJlciA9IDA7XHJcblx0Z2V0IGkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9pO1xyXG5cdH1cclxuICAvL3TDpGjDpG4ga2Fpa2tpIG1pdMOkIGhhbHV0YWFuIHRhcGFodHV2YW4gbWVudXN0YVxyXG5cdHNldCBpKGk6IG51bWJlcikge1xyXG5cdFx0dGhpcy5faSA9IGk7XHJcbiAgICB0aGlzLm1lbnVMaXN0ZW5lcihpKTtcclxuXHJcbiAgfVxyXG5cclxuICBtZW51TGlzdGVuZXIoaSkge1xyXG4gICAgY29uc29sZS5sb2coaSk7XHJcbiAgICBpZihpID09IDEpIHtcclxuICAgICAgYWxlcnQoXCJOb3QgaW4gdXNlXCIpO1xyXG4gICAgfTtcclxuXHJcbiAgICBpZihpID09IDQpIHtcclxuICAgICAgYWxlcnQoXCJMb2dnaW5nIG91dFwiKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJvdXRlcjogUm91dGVyLCBwcml2YXRlIHdlbnR1cmVQb2ludFNlcnZpY2U6IFdlbnR1cmVQb2ludFNlcnZpY2UsIHByaXZhdGUgcGFnZTogUGFnZSwgcHJpdmF0ZSBfbW9kYWxTZXJ2aWNlOiBNb2RhbERpYWxvZ1NlcnZpY2UsIHByaXZhdGUgdmNSZWY6IFZpZXdDb250YWluZXJSZWYpIHtcclxuICAgIHRoaXMud2VudHVyZVBvaW50U2VydmljZS5wb3B1bGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkluaXQoKSB7XHJcbiAgICAvLyBUT0RPOiBMb2FkZXI/XHJcbiAgICAvLyBUT0RPOiBtZW51aXRlbSBpY29uaXQgcHV1dHR1dSwgYWN0aW9uYmFyaW4gbWFoZCBwaWlsb3R0YW1pbmVuKD8pXHJcbiAgICBUbnNTaWRlRHJhd2VyLmJ1aWxkKHtcclxuICAgICAgdGVtcGxhdGVzOiBbe1xyXG4gICAgICAgICAgdGl0bGU6ICdXZW50dXJlcG9pbnRzJyxcclxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19ob21lX3doaXRlXzI0ZHAnLFxyXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfaG9tZV93aGl0ZScsXHJcbiAgICAgIH0sIHtcclxuICAgICAgICAgIHRpdGxlOiAnUm91dGVzJyxcclxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19nYXZlbF93aGl0ZV8yNGRwJyxcclxuICAgICAgICAgIC8vaW9zSWNvbjogJ2ljX2dhdmVsX3doaXRlJyxcclxuICAgICAgfSwge1xyXG4gICAgICAgICAgdGl0bGU6ICdNeSBXZW50dXJlcycsXHJcbiAgICAgICAgICAvL2FuZHJvaWRJY29uOiAnaWNfYWNjb3VudF9iYWxhbmNlX3doaXRlXzI0ZHAnLFxyXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfYWNjb3VudF9iYWxhbmNlX3doaXRlJyxcclxuICAgICAgfSwge1xyXG4gICAgICAgICAgdGl0bGU6ICdTZXR0aW5ncycsXHJcbiAgICAgICAgLy8gIGFuZHJvaWRJY29uOiAnaWNfYnVpbGRfd2hpdGVfMjRkcCcsXHJcbiAgICAgICAgLy8gIGlvc0ljb246ICdpY19idWlsZF93aGl0ZScsXHJcbiAgICAgIH0sIHtcclxuICAgICAgICAgIHRpdGxlOiAnTG9nIG91dCcsXHJcbiAgICAgICAgLy8gIGFuZHJvaWRJY29uOiAnaWNfYWNjb3VudF9jaXJjbGVfd2hpdGVfMjRkcCcsXHJcbiAgICAgICAgLy8gIGlvc0ljb246ICdpY19hY2NvdW50X2NpcmNsZV93aGl0ZScsXHJcbiAgICAgIH1dLFxyXG4gICAgICB0aXRsZTogJ1dlbnR1cmUnLFxyXG4gICAgICBzdWJ0aXRsZTogJ3lvdXIgdXJiYW4gYWR2ZW50dXJlIScsXHJcbiAgICAgIGxpc3RlbmVyOiAoaW5kZXgpID0+IHtcclxuICAgICAgICAgIHRoaXMuaSA9IGluZGV4XHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbnRleHQ6IHRoaXMsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIFRuc1NpZGVEcmF3ZXJPcHRpb25zTGlzdGVuZXIgPSAoaW5kZXgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKGluZGV4KVxyXG4gIH07XHJcblxyXG4gIHRvZ2dsZVNpZGVEcmF3ZXIoKSB7XHJcbiAgICBUbnNTaWRlRHJhd2VyLnRvZ2dsZSgpO1xyXG5cclxuICB9XHJcblxyXG5cclxuICBjcmVhdGVNb2RlbFZpZXcobWFyaykge1xyXG4gICAgbGV0IHRoYXQgPSB0aGlzO1xyXG4gICAgbGV0IG9wdGlvbnM6IE1vZGFsRGlhbG9nT3B0aW9ucyA9IHtcclxuICAgICAgICB2aWV3Q29udGFpbmVyUmVmOiB0aGlzLnZjUmVmLFxyXG4gICAgICAgIGNvbnRleHQ6IG1hcmssXHJcbiAgICAgICAgZnVsbHNjcmVlbjogdHJ1ZVxyXG4gICAgfTtcclxuICAgIC8vID4+IHJldHVybmluZy1yZXN1bHRcclxuICAgIHRoaXMuX21vZGFsU2VydmljZS5zaG93TW9kYWwoUHJpemVWaWV3Q29tcG9uZW50LCBvcHRpb25zKVxyXG4gICAgICAgIC50aGVuKCgvKiAqLykgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtYXJrLnRpdGxlKTtcclxuICAgICAgICB9KTtcclxuICAgIC8vIDw8IHJldHVybmluZy1yZXN1bHRcclxuICB9XHJcblxyXG4gIGNvbGxlY3RCdXR0b25UYXBwZWQoKSB7XHJcbiAgICAvLyBUT0RPOiBUw6Row6RuIHNlIGtlcsOkeXN0b2ltaW50bywgaWYgZGlzdGFuY2UganRuLCBuaWluIHR1b2x0YSB0b2kgY29sbGVjdCgpXHJcbiAgICAvLyBUaGlzIG1pZ2h0IGJlIHN0dXBpZCwgYnV0IHdvcmtzIGZvciBub3cgOilcclxuICAgIC8vVE9ETzogYWRkaW5nIGNvbGxlY3RlZCBtYXJrZXIgdG8gYSBsaXN0IGV0Yy4gYjQgcmVtb3ZpbmdcclxuXHJcbiAgICAgIGNvbGxlY3REaXN0YW5jZSA9IDUwO1xyXG4gICAgICBpZihnZXREaXN0YW5jZVRvKHNlbGVjdGVkTWFya2VyKSA8IGNvbGxlY3REaXN0YW5jZSkge1xyXG4gICAgICAgIGxldCBhbW91bnQgPSBob3dNYW55Q29sbGVjdGVkKCk7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0KGFtb3VudCwgc2VsZWN0ZWRNYXJrZXIpO1xyXG4gICAgICAgIC8vYWxlcnQoXCJWZW50dXJlIHBvaW50IGNvbGxlY3RlZC4gXFxuQ29sbGVjdGVkOiBcIiArIGFtb3VudCk7XHJcbiAgICAgICAgY29sbGVjdGVkTWFya2Vycy5wdXNoKHNlbGVjdGVkTWFya2VyKTtcclxuICAgICAgICBtYXBWaWV3LnJlbW92ZU1hcmtlcihzZWxlY3RlZE1hcmtlcik7XHJcbiAgICAgICAgLy9cclxuICAgICAgICBjb25zb2xlLmxvZyhcIllvdSBoYXZlIFwiICsgY29sbGVjdGVkTWFya2Vycy5sZW5ndGggKyBcIiBjb2xsZWN0ZWQgbWFya2Vycy5cIilcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlxcbk1hcmtlciB0b28gZmFyIGF3YXksIG1vdmUgY2xvc2VyLlwiKTtcclxuICAgICAgfVxyXG5cclxuICB9XHJcblxyXG4gIGNvbGxlY3QoYW1vdW50LCBtYXJrKSB7XHJcbiAgICB0aGlzLmNyZWF0ZU1vZGVsVmlldyhtYXJrKTtcclxuICB9XHJcblxyXG4gIGFkZFdlbnR1cmVQb2ludHMobWFwVmlldykge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHdQb2ludCA9IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpO1xyXG4gICAgICB2YXIgbWFya2VyID0gbmV3IG1hcHNNb2R1bGUuTWFya2VyKCk7XHJcblxyXG4gICAgICBtYXJrZXIucG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyh3UG9pbnQubGF0LCB3UG9pbnQubG5nKTtcclxuICAgICAgbWFya2VyLnRpdGxlID0gd1BvaW50LnRpdGxlO1xyXG4gICAgICBtYXJrZXIuc25pcHBldCA9IFwiXCI7XHJcbiAgICAgIC8vQW5kcm9pZGlsbGEgdG9pbWlpLiBJb3NpbGxlIHBpdMOkw6Qga2F0c29hIG1pdGVuIHJlc291cmNlIHRvaW1paS4gUEM6bGzDpCBlaSBweXN0eXTDpCB0ZXN0YWFtYWFuXHJcbiAgICAgIC8vSWtvbmlhIGpvdXR1dSBoaWVtbmEgbXVva2thYW1hYW4ocGllbmVtbcOka3NpIGphIGxpc8OkdMOkw6RuIHBpZW5pIG9zb2l0aW4gYWxhbGFpdGFhbilcclxuICAgICAgdmFyIGljb24gPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgaWNvbi5pbWFnZVNvdXJjZSA9IGltYWdlU291cmNlLmZyb21SZXNvdXJjZSgnaWNvbicpO1xyXG4gICAgICBtYXJrZXIuaWNvbiA9IGljb247XHJcbiAgICAgIG1hcmtlci5kcmFnZ2FibGUgPSB0cnVlO1xyXG4gICAgICBtYXJrZXIudXNlckRhdGEgPSB7aW5kZXg6IDF9O1xyXG4gICAgICBtYXBWaWV3LmFkZE1hcmtlcihtYXJrZXIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy9NYXAgZXZlbnRzXHJcbiAgb25NYXBSZWFkeSA9IChldmVudCkgPT4ge1xyXG4gICAgc3RhcnRXYXRjaChldmVudCk7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgbG9jYXRpb24gc2VydmljZXMgYXJlIGVuYWJsZWRcclxuICAgIGlmICghZ2VvbG9jYXRpb24uaXNFbmFibGVkKCkpIHtcclxuICAgICAgICBnZW9sb2NhdGlvbi5lbmFibGVMb2NhdGlvblJlcXVlc3QoKTtcclxuICAgIH0gZWxzZSBjb25zb2xlLmxvZyhcIkxvY2F0aW9uIHNlcnZpY2VzIGVuYWJsZWQuXCIpO1xyXG5cclxuICAgIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XHJcbiAgICB2YXIgZ01hcCA9IG1hcFZpZXcuZ01hcDtcclxuXHJcbiAgICB0aGlzLmFkZFdlbnR1cmVQb2ludHMobWFwVmlldyk7XHJcblxyXG4gIH07XHJcblxyXG4gIG9uQ29vcmRpbmF0ZVRhcHBlZCA9IChldmVudCkgPT4ge1xyXG4gICAgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcclxuICAgIHRoaXMud2VudHVyZVBvaW50VGl0bGUgPSBcIlwiO1xyXG4gICAgdGhpcy53ZW50dXJlUG9pbnRJbmZvID0gXCJcIjtcclxuICAgIHRoaXMubWFya2VySXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gIH07XHJcblxyXG4gIG9uQ29vcmRpbmF0ZUxvbmdQcmVzcyA9IChldmVudCkgPT4ge1xyXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XHJcbiAgICB2YXIgbGF0ID0gZXZlbnQucG9zaXRpb24ubGF0aXR1ZGU7XHJcbiAgICB2YXIgbG5nID0gZXZlbnQucG9zaXRpb24ubG9uZ2l0dWRlO1xyXG4gIH07XHJcblxyXG4gIG9uTWFya2VyU2VsZWN0ID0gKGV2ZW50KSA9PiB7XHJcblxyXG4gICAgaW50ZXJmYWNlIFBvc2l0aW9uT2JqZWN0IHtcclxuICAgICAgXCJsYXRpdHVkZVwiOiBzdHJpbmcsXHJcbiAgICAgIFwibG9uZ2l0dWRlXCI6IHN0cmluZ1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xyXG5cclxuICAgIGxldCBtYXJrZXJQb3MgPSBKU09OLnN0cmluZ2lmeShldmVudC5tYXJrZXIucG9zaXRpb24pO1xyXG4gICAgbGV0IGN1cnJlbnRQb3MgPSBKU09OLnN0cmluZ2lmeShjdXJyZW50UG9zaXRpb24pO1xyXG4gICAgbGV0IGRpc3RhbmNlID0gZ2V0RGlzdGFuY2VUbyhldmVudC5tYXJrZXIpO1xyXG5cclxuICAgIC8vIE1ha2UgYm90dG9tIGJhciB2aXNpYmxlXHJcbiAgICB0aGlzLm1hcmtlcklzU2VsZWN0ZWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIENoYW5nZSB0aGUgY29udGVudCBvZiB0aGUgYm90dG9tIGJhciB0ZXh0XHJcbiAgICB0aGlzLndlbnR1cmVQb2ludFRpdGxlID0gZXZlbnQubWFya2VyLnRpdGxlO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChldmVudC5tYXJrZXIudGl0bGUgPT09IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpLnRpdGxlKSB7XHJcbiAgICAgICAgdGhpcy53ZW50dXJlUG9pbnRJbmZvID0gdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSkuaW5mbztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV2ZW50Lm1hcmtlci5zbmlwcGV0ID0gXCJEaXN0YW5jZTogXCIgKyBkaXN0YW5jZS50b0ZpeGVkKDApICsgXCIgbVwiO1xyXG4gICAgaWYgKGRpc3RhbmNlIDwgNTApIHtcclxuICAgICAgdGhpcy5pc0Nsb3NlRW5vdWdoVG9Db2xsZWN0ID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB0aGlzLmlzQ2xvc2VFbm91Z2hUb0NvbGxlY3QgPSBmYWxzZTtcclxuXHJcbiAgICBzZWxlY3RlZE1hcmtlciA9IGV2ZW50Lm1hcmtlcjtcclxuXHJcbiAgfTtcclxuXHJcbiAgb25NYXJrZXJCZWdpbkRyYWdnaW5nID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckJlZ2luRHJhZ2dpbmdcIik7XHJcbiAgfTtcclxuXHJcbiAgb25NYXJrZXJFbmREcmFnZ2luZyA9IChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJFbmREcmFnZ2luZ1wiKTtcclxuICB9O1xyXG5cclxuICBvbk1hcmtlckRyYWcgPSAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyRHJhZ1wiKTtcclxuICB9O1xyXG5cclxuICBvbkNhbWVyYUNoYW5nZWQgPSAoZXZlbnQpID0+IHtcclxuICAgIC8vXHJcbiAgfTtcclxuXHJcbiAgb25TaGFwZVNlbGVjdCA9IChldmVudCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coXCJTaGFwZSBzZWxlY3RlZC5cIik7XHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0V2F0Y2goZXZlbnQpIHtcclxuXHJcbiAgaW50ZXJmYWNlIExvY2F0aW9uT2JqZWN0IHtcclxuICAgIFwibGF0aXR1ZGVcIjogbnVtYmVyLFxyXG4gICAgXCJsb25naXR1ZGVcIjogbnVtYmVyLFxyXG4gICAgXCJhbHRpdHVkZVwiOiBudW1iZXIsXHJcbiAgICBcImhvcml6b250YWxBY2N1cmFjeVwiOiBudW1iZXIsXHJcbiAgICBcInZlcnRpY2FsQWNjdXJhY3lcIjogbnVtYmVyLFxyXG4gICAgXCJzcGVlZFwiOiBudW1iZXIsXHJcbiAgICBcImRpcmVjdGlvblwiOiBudW1iZXIsXHJcbiAgICBcInRpbWVzdGFtcFwiOnN0cmluZ1xyXG4gIH1cclxuXHJcbiAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XHJcbiAgY3VycmVudFBvc0NpcmNsZSA9IG5ldyBtYXBzTW9kdWxlLkNpcmNsZSgpO1xyXG4gIGN1cnJlbnRQb3NDaXJjbGUuY2VudGVyID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcoMCwgMCk7XHJcbiAgY3VycmVudFBvc0NpcmNsZS52aXNpYmxlID0gdHJ1ZTtcclxuICBjdXJyZW50UG9zQ2lyY2xlLnJhZGl1cyA9IDIwO1xyXG4gIGN1cnJlbnRQb3NDaXJjbGUuZmlsbENvbG9yID0gbmV3IENvbG9yKCcjNmM5ZGYwJyk7XHJcbiAgY3VycmVudFBvc0NpcmNsZS5zdHJva2VDb2xvciA9IG5ldyBDb2xvcignIzM5NmFiZCcpO1xyXG4gIGN1cnJlbnRQb3NDaXJjbGUuc3Ryb2tld2lkdGggPSAyO1xyXG4gIGN1cnJlbnRQb3NDaXJjbGUuY2xpY2thYmxlID0gdHJ1ZTtcclxuICBtYXBWaWV3LmFkZENpcmNsZShjdXJyZW50UG9zQ2lyY2xlKTtcclxuXHJcbiAgd2F0Y2hJZCA9IGdlb2xvY2F0aW9uLndhdGNoTG9jYXRpb24oXHJcbiAgZnVuY3Rpb24gKGxvYykge1xyXG4gICAgICBpZiAobG9jKSB7XHJcbiAgICAgICAgICBsZXQgb2JqOiBMb2NhdGlvbk9iamVjdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobG9jKSk7XHJcbiAgICAgICAgICB0aGlzLmxhdGl0dWRlID0gb2JqLmxhdGl0dWRlO1xyXG4gICAgICAgICAgdGhpcy5sb25naXR1ZGUgPSBvYmoubG9uZ2l0dWRlO1xyXG4gICAgICAgICAgdGhpcy5hbHRpdHVkZSA9IG9iai5hbHRpdHVkZTtcclxuICAgICAgICAgIGN1cnJlbnRQb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKG9iai5sYXRpdHVkZSwgb2JqLmxvbmdpdHVkZSk7XHJcblxyXG4gICAgICAgICAgY3VycmVudFBvc0NpcmNsZS5jZW50ZXIgPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyh0aGlzLmxhdGl0dWRlLCB0aGlzLmxvbmdpdHVkZSk7XHJcblxyXG4gICAgICAgICAgbWFwVmlldy5sYXRpdHVkZSA9IHRoaXMubGF0aXR1ZGU7XHJcbiAgICAgICAgICBtYXBWaWV3LmxvbmdpdHVkZSA9IHRoaXMubG9uZ2l0dWRlO1xyXG4gICAgICB9XHJcbiAgfSxcclxuICBmdW5jdGlvbihlKXtcclxuICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBlLm1lc3NhZ2UpO1xyXG4gIH0sXHJcbiAge2Rlc2lyZWRBY2N1cmFjeTogMywgdXBkYXRlRGlzdGFuY2U6IDEwLCBtaW5pbXVtVXBkYXRlVGltZSA6IDEwMDAgKiAyfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlbmRXYXRjaCgpIHtcclxuICAgIGlmICh3YXRjaElkKSB7XHJcbiAgICAgICAgZ2VvbG9jYXRpb24uY2xlYXJXYXRjaCh3YXRjaElkKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIk15IHdhdGNoIGlzIGVuZGVkLi4uIFQuIEpvbiBTbm93XCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyBUT0RPOiB0b2ltaW1hYW4gYW5kcm9pZGlsbGUga2Fuc3NhXHJcbmZ1bmN0aW9uIGdldERpc3RhbmNlVG8ob2JqKSB7XHJcbiAgbGV0IG9ialBvcyA9IEpTT04uc3RyaW5naWZ5KG9iai5wb3NpdGlvbik7XHJcbiAgbGV0IGN1cnJlbnRQb3MgPSBKU09OLnN0cmluZ2lmeShjdXJyZW50UG9zaXRpb24pO1xyXG4gIGxldCBkaXN0YW5jZSA9IG51bGw7XHJcblxyXG4gIGlmKGlzSU9TKSB7XHJcbiAgICAvL2NvbnNvbGUubG9nKFwiUnVubmluZyBvbiBpb3MuXCIpXHJcbiAgICBkaXN0YW5jZSA9IGdlb2xvY2F0aW9uLmRpc3RhbmNlKEpTT04ucGFyc2Uob2JqUG9zKS5faW9zLCBKU09OLnBhcnNlKGN1cnJlbnRQb3MpLl9pb3MpO1xyXG4gIH0gZWxzZSBpZihpc0FuZHJvaWQpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiUnVubmluZyBvbiBhbmRyb2lkLlwiKTtcclxuICAgIGRpc3RhbmNlID0gMzsvL2dlb2xvY2F0aW9uLmRpc3RhbmNlKEpTT04ucGFyc2Uob2JqUG9zKS5fYW5kcm9pZCwgSlNPTi5wYXJzZShjdXJyZW50UG9zKS5fYW5kcm9pZCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRpc3RhbmNlID0gXCJlcnJvclwiO1xyXG4gICAgY29uc29sZS5sb2coXCJDb3VsZCBub3QgZmluZCBkaXN0YW5jZS5cIik7XHJcbiAgfVxyXG4gICAgcmV0dXJuIGRpc3RhbmNlO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gaG93TWFueUNvbGxlY3RlZCgpIHtcclxuICByZXR1cm4gY29sbGVjdGVkTWFya2Vycy5sZW5ndGggKyAxO1xyXG59XHJcblxyXG4vL2hhbmRsZXMgdGhlIGNvbGxlY3Rpb24gYW5kIHJldHVybnMgbWVzc2FnZVxyXG5mdW5jdGlvbiBjb2xsZWN0KGFtb3VudCwgbWFyaykge1xyXG4gIGRpYWxvZ3NNb2R1bGUuYWxlcnQoe1xyXG4gICAgbWVzc2FnZTogXCJXZW50dXJlIHBvaW50IFwiICsgbWFyay50aXRsZSArIFwiIGNvbGxlY3RlZCEgXFxuWW91IGhhdmU6IFwiICsgYW1vdW50LFxyXG4gICAgb2tCdXR0b25UZXh0OiBcIk9LXCJcclxuICB9KTtcclxufVxyXG4iXX0=