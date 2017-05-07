"use strict";
var core_1 = require("@angular/core");
var platform_1 = require("platform");
var element_registry_1 = require("nativescript-angular/element-registry");
var modal_dialog_1 = require("nativescript-angular/modal-dialog");
var geolocation = require("nativescript-geolocation");
var nativescript_ngx_fonticon_1 = require("nativescript-ngx-fonticon");
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
    function MapPageComponent(router, fonticon, wenturePointService, page, _modalService, vcRef) {
        var _this = this;
        this.router = router;
        this.fonticon = fonticon;
        this.wenturePointService = wenturePointService;
        this.page = page;
        this._modalService = _modalService;
        this.vcRef = vcRef;
        this.isSidedrawerVisible = false;
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
            textColor: new color_1.Color("white"),
            headerBackgroundColor: new color_1.Color("#383838"),
            backgroundColor: new color_1.Color("#282828"),
            logoImage: imageSource.fromResource('icon'),
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
    __metadata("design:paramtypes", [router_1.Router, nativescript_ngx_fonticon_1.TNSFontIconService, wenturepoint_service_1.WenturePointService, page_1.Page, modal_dialog_1.ModalDialogService, core_1.ViewContainerRef])
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBMkY7QUFDM0YscUNBQTRDO0FBQzVDLDBFQUFzRTtBQUN0RSxrRUFBMkY7QUFDM0Ysc0RBQXdEO0FBQ3hELHVFQUErRDtBQUMvRCwwQ0FBeUM7QUFDekMsZ0NBQStCO0FBRS9CLCtCQUE4QjtBQUk5Qix1RkFBcUY7QUFDckYsbUVBQXdEO0FBRXhELDJDQUFrRDtBQUVsRCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUN6RCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDMUMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN0QyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFMUMsSUFBSSxPQUFZLENBQUM7QUFDakIsSUFBSSxlQUF5QixDQUFDO0FBQzlCLElBQUksZ0JBQXFCLENBQUM7QUFDMUIsSUFBSSxlQUF1QixDQUFDLENBQUMsdURBQXVEO0FBQ3BGLElBQUksT0FBWSxDQUFDO0FBQ2pCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzFCLElBQUksY0FBYyxDQUFDO0FBRW5CLGtDQUFlLENBQUMsU0FBUyxFQUFFLGNBQU0sT0FBQSxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxPQUFPLEVBQS9DLENBQStDLENBQUMsQ0FBQztBQVVsRixJQUFhLGdCQUFnQjtJQW1DM0IsMEJBQW9CLE1BQWMsRUFBVSxRQUE0QixFQUFVLG1CQUF3QyxFQUFVLElBQVUsRUFBVSxhQUFpQyxFQUFVLEtBQXVCO1FBQTFOLGlCQUVDO1FBRm1CLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFvQjtRQUFVLHdC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QUNsQixPQUFPLEVBQUUsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRywwQkFBMEIsR0FBRyxNQUFNO1FBQzVFLFlBQVksRUFBRSxJQUFJO0tBQ25CLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIE9uSW5pdCwgVmlld0NoaWxkLCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGlzQW5kcm9pZCwgaXNJT1MgfSBmcm9tIFwicGxhdGZvcm1cIjtcbmltcG9ydCB7cmVnaXN0ZXJFbGVtZW50fSBmcm9tIFwibmF0aXZlc2NyaXB0LWFuZ3VsYXIvZWxlbWVudC1yZWdpc3RyeVwiO1xuaW1wb3J0IHsgTW9kYWxEaWFsb2dTZXJ2aWNlLCBNb2RhbERpYWxvZ09wdGlvbnMgfSBmcm9tIFwibmF0aXZlc2NyaXB0LWFuZ3VsYXIvbW9kYWwtZGlhbG9nXCI7XG5pbXBvcnQgKiBhcyBnZW9sb2NhdGlvbiBmcm9tIFwibmF0aXZlc2NyaXB0LWdlb2xvY2F0aW9uXCI7XG5pbXBvcnQgeyBUTlNGb250SWNvblNlcnZpY2UgfSBmcm9tICduYXRpdmVzY3JpcHQtbmd4LWZvbnRpY29uJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IFBhZ2UgfSBmcm9tIFwidWkvcGFnZVwiO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSBcInVpL2J1dHRvblwiO1xuaW1wb3J0IHsgQ29sb3IgfSBmcm9tIFwiY29sb3JcIjtcbi8vaW1wb3J0IHsgSW1hZ2UgfSBmcm9tIFwidWkvaW1hZ2VcIjtcbmltcG9ydCB7IEltYWdlU291cmNlIH0gZnJvbSBcImltYWdlLXNvdXJjZVwiO1xuaW1wb3J0IHsgV2VudHVyZVBvaW50IH0gZnJvbSBcIi4uLy4uL3NoYXJlZC93ZW50dXJlcG9pbnQvd2VudHVyZXBvaW50XCI7XG5pbXBvcnQgeyBXZW50dXJlUG9pbnRTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uL3NoYXJlZC93ZW50dXJlcG9pbnQvd2VudHVyZXBvaW50LnNlcnZpY2VcIjtcbmltcG9ydCB7IFRuc1NpZGVEcmF3ZXIgfSBmcm9tICduYXRpdmVzY3JpcHQtc2lkZWRyYXdlcic7XG5pbXBvcnQgeyBUbnNTaWRlRHJhd2VyT3B0aW9uc0xpc3RlbmVyIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXNpZGVkcmF3ZXInO1xuaW1wb3J0IHsgUHJpemVWaWV3Q29tcG9uZW50IH0gZnJvbSBcIi4vcHJpemUtdmlld1wiO1xuXG52YXIgbWFwc01vZHVsZSA9IHJlcXVpcmUoXCJuYXRpdmVzY3JpcHQtZ29vZ2xlLW1hcHMtc2RrXCIpO1xudmFyIGRpYWxvZ3NNb2R1bGUgPSByZXF1aXJlKFwidWkvZGlhbG9nc1wiKTtcbnZhciBJbWFnZSA9IHJlcXVpcmUoXCJ1aS9pbWFnZVwiKS5JbWFnZTtcbnZhciBpbWFnZVNvdXJjZSA9IHJlcXVpcmUoXCJpbWFnZS1zb3VyY2VcIik7XG5cbnZhciB3YXRjaElkOiBhbnk7XG52YXIgY3VycmVudFBvc2l0aW9uOiBMb2NhdGlvbjtcbnZhciBjdXJyZW50UG9zQ2lyY2xlOiBhbnk7XG52YXIgY29sbGVjdERpc3RhbmNlOiBudW1iZXI7IC8vZGlzdGFuY2UgaW4gbSBvbiBob3cgY2xvc2UgdG8gZW5hYmxlIGNvbGxlY3QtcHJvcGVydHlcbnZhciBtYXBWaWV3OiBhbnk7XG52YXIgY29sbGVjdGVkTWFya2VycyA9IFtdO1xudmFyIHNlbGVjdGVkTWFya2VyO1xuXG5yZWdpc3RlckVsZW1lbnQoXCJNYXBWaWV3XCIsICgpID0+IHJlcXVpcmUoXCJuYXRpdmVzY3JpcHQtZ29vZ2xlLW1hcHMtc2RrXCIpLk1hcFZpZXcpO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6IFwibWFwLXBhZ2VcIixcbiAgcHJvdmlkZXJzOiBbV2VudHVyZVBvaW50U2VydmljZSwgTW9kYWxEaWFsb2dTZXJ2aWNlXSxcbiAgdGVtcGxhdGVVcmw6IFwicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UuaHRtbFwiLFxuICBzdHlsZVVybHM6IFtcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLWNvbW1vbi5jc3NcIiwgXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS5jc3NcIl1cbn0pXG5cblxuZXhwb3J0IGNsYXNzIE1hcFBhZ2VDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBAVmlld0NoaWxkKFwiTWFwVmlld1wiKSBtYXBWaWV3OiBFbGVtZW50UmVmO1xuICBAVmlld0NoaWxkKFwiY29sbGVjdEJ1dHRvblwiKSBjb2xsZWN0QnV0dG9uOiBFbGVtZW50UmVmO1xuXG4gIGxhdGl0dWRlOiBudW1iZXI7XG4gIGxvbmdpdHVkZTogbnVtYmVyO1xuICBhbHRpdHVkZTogbnVtYmVyO1xuICB3ZW50dXJlUG9pbnRUaXRsZTogc3RyaW5nO1xuICB3ZW50dXJlUG9pbnRJbmZvOiBzdHJpbmc7XG4gIG1hcmtlcklzU2VsZWN0ZWQ6IGJvb2xlYW47XG4gIGlzQ2xvc2VFbm91Z2hUb0NvbGxlY3Q6IGJvb2xlYW47XG4gIGlzU2lkZWRyYXdlclZpc2libGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgLy9pIHN0b3JlcyB0aGUgaW5kZXggdmFsdWUgb2YgbWVudVxuICBwcml2YXRlIF9pOiBudW1iZXIgPSAwO1xuXHRnZXQgaSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9pO1xuXHR9XG4gIC8vaSBzYWFkYWFuIG1lbnVuIHNpc8Okw6RucmFrZW5uZXR1c3RhIGt1dW50ZWxpamFzdGFcblx0c2V0IGkoaTogbnVtYmVyKSB7XG5cdFx0dGhpcy5faSA9IGk7XG4gICAgdGhpcy5tZW51TGlzdGVuZXIoaSk7XG5cbiAgfVxuLy8gdMOkaMOkbiBtZW51biB0b2ltaW5uYWxsaXN1dXNcbiAgbWVudUxpc3RlbmVyKGkpIHtcbiAgICBjb25zb2xlLmxvZyhpKTtcbiAgICBpZihpID09IDEpIHtcbiAgICAgIGFsZXJ0KFwiUm91dGVzIGFyZSB5ZXQgdG8gY29tZVwiKTtcbiAgICB9O1xuXG4gICAgaWYoaSA9PSA0KSB7XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFtcIi9cIl0pO1xuICAgIH07XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJvdXRlcjogUm91dGVyLCBwcml2YXRlIGZvbnRpY29uOiBUTlNGb250SWNvblNlcnZpY2UsIHByaXZhdGUgd2VudHVyZVBvaW50U2VydmljZTogV2VudHVyZVBvaW50U2VydmljZSwgcHJpdmF0ZSBwYWdlOiBQYWdlLCBwcml2YXRlIF9tb2RhbFNlcnZpY2U6IE1vZGFsRGlhbG9nU2VydmljZSwgcHJpdmF0ZSB2Y1JlZjogVmlld0NvbnRhaW5lclJlZikge1xuICAgIHRoaXMud2VudHVyZVBvaW50U2VydmljZS5wb3B1bGF0ZSgpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gVE9ETzogTG9hZGVyP1xuICAgIC8vIFRPRE86IG1lbnVpdGVtIGljb25pdCBwdXV0dHV1LCBhY3Rpb25iYXJpbiBtYWhkIHBpaWxvdHRhbWluZW4oPylcbiAgICBUbnNTaWRlRHJhd2VyLmJ1aWxkKHtcbiAgICAgIHRlbXBsYXRlczogW3tcbiAgICAgICAgICB0aXRsZTogJ1dlbnR1cmVwb2ludHMnLFxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19ob21lX3doaXRlXzI0ZHAnLFxuICAgICAgICAgIC8vaW9zSWNvbjogJ2ljX2hvbWVfd2hpdGUnLFxuICAgICAgfSwge1xuICAgICAgICAgIHRpdGxlOiAnUm91dGVzJyxcbiAgICAgICAgICAvL2FuZHJvaWRJY29uOiAnaWNfZ2F2ZWxfd2hpdGVfMjRkcCcsXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfZ2F2ZWxfd2hpdGUnLFxuICAgICAgfSwge1xuICAgICAgICAgIHRpdGxlOiAnTXkgV2VudHVyZXMnLFxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19hY2NvdW50X2JhbGFuY2Vfd2hpdGVfMjRkcCcsXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfYWNjb3VudF9iYWxhbmNlX3doaXRlJyxcbiAgICAgIH0sIHtcbiAgICAgICAgICB0aXRsZTogJ1NldHRpbmdzJyxcbiAgICAgICAgLy8gIGFuZHJvaWRJY29uOiAnaWNfYnVpbGRfd2hpdGVfMjRkcCcsXG4gICAgICAgIC8vICBpb3NJY29uOiAnaWNfYnVpbGRfd2hpdGUnLFxuICAgICAgfSwge1xuICAgICAgICAgIHRpdGxlOiAnTG9nIG91dCcsXG4gICAgICAgIC8vICBhbmRyb2lkSWNvbjogJ2ljX2FjY291bnRfY2lyY2xlX3doaXRlXzI0ZHAnLFxuICAgICAgICAvLyAgaW9zSWNvbjogJ2ljX2FjY291bnRfY2lyY2xlX3doaXRlJyxcbiAgICAgIH1dLFxuICAgICAgdGV4dENvbG9yOiBuZXcgQ29sb3IoXCJ3aGl0ZVwiKSwgLy8gY29sb3Igb2YgYWxsIHRleHQgaW5jbHVkaW5nIHRpdGxlLCBzdWJ0aXRsZSwgYW5kIGl0ZW1zXG5cdCAgICBoZWFkZXJCYWNrZ3JvdW5kQ29sb3I6IG5ldyBDb2xvcihcIiMzODM4MzhcIiksXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IG5ldyBDb2xvcihcIiMyODI4MjhcIiksIC8vIGJhY2tncm91bmQgY29sb3IgdW5kZXIgdGhlIGhlYWRlclxuICAgICAgbG9nb0ltYWdlOiBpbWFnZVNvdXJjZS5mcm9tUmVzb3VyY2UoJ2ljb24nKSxcbiAgICAgIHRpdGxlOiAnV2VudHVyZScsXG4gICAgICBzdWJ0aXRsZTogJ3lvdXIgdXJiYW4gYWR2ZW50dXJlIScsXG4gICAgICBsaXN0ZW5lcjogKGluZGV4KSA9PiB7XG4gICAgICAgICAgdGhpcy5pID0gaW5kZXhcbiAgICAgIH0sXG4gICAgICBjb250ZXh0OiB0aGlzLFxuICAgIH0pO1xuICB9XG5cbiAgVG5zU2lkZURyYXdlck9wdGlvbnNMaXN0ZW5lciA9IChpbmRleCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGluZGV4KVxuICB9O1xuXG4gIHRvZ2dsZVNpZGVEcmF3ZXIoKSB7XG4gICAgVG5zU2lkZURyYXdlci50b2dnbGUoKTtcbiAgfVxuXG5cbiAgY3JlYXRlTW9kZWxWaWV3KG1hcmspIHtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IG9wdGlvbnM6IE1vZGFsRGlhbG9nT3B0aW9ucyA9IHtcbiAgICAgICAgdmlld0NvbnRhaW5lclJlZjogdGhpcy52Y1JlZixcbiAgICAgICAgY29udGV4dDogbWFyayxcbiAgICAgICAgZnVsbHNjcmVlbjogdHJ1ZVxuICAgIH07XG4gICAgLy8gPj4gcmV0dXJuaW5nLXJlc3VsdFxuICAgIHRoaXMuX21vZGFsU2VydmljZS5zaG93TW9kYWwoUHJpemVWaWV3Q29tcG9uZW50LCBvcHRpb25zKVxuICAgICAgICAudGhlbigoLyogKi8pID0+IHtcbiAgICAgICAgICAgIHRoaXMubWFya2VySXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAvLyA8PCByZXR1cm5pbmctcmVzdWx0XG4gIH1cblxuICBjb2xsZWN0QnV0dG9uVGFwcGVkKCkge1xuICAgIC8vIFRPRE86IFTDpGjDpG4gc2Uga2Vyw6R5c3RvaW1pbnRvLCBpZiBkaXN0YW5jZSBqdG4sIG5paW4gdHVvbHRhIHRvaSBjb2xsZWN0KClcbiAgICAvLyBUaGlzIG1pZ2h0IGJlIHN0dXBpZCwgYnV0IHdvcmtzIGZvciBub3cgOilcbiAgICAvL1RPRE86IGFkZGluZyBjb2xsZWN0ZWQgbWFya2VyIHRvIGEgbGlzdCBldGMuIGI0IHJlbW92aW5nXG5cbiAgICAgIGNvbGxlY3REaXN0YW5jZSA9IDUwO1xuICAgICAgaWYoZ2V0RGlzdGFuY2VUbyhzZWxlY3RlZE1hcmtlcikgPCBjb2xsZWN0RGlzdGFuY2UpIHtcbiAgICAgICAgbGV0IGFtb3VudCA9IGhvd01hbnlDb2xsZWN0ZWQoKTtcbiAgICAgICAgdGhpcy5jb2xsZWN0KGFtb3VudCwgc2VsZWN0ZWRNYXJrZXIpO1xuICAgICAgICAvL2FsZXJ0KFwiVmVudHVyZSBwb2ludCBjb2xsZWN0ZWQuIFxcbkNvbGxlY3RlZDogXCIgKyBhbW91bnQpO1xuICAgICAgICBjb2xsZWN0ZWRNYXJrZXJzLnB1c2goc2VsZWN0ZWRNYXJrZXIpO1xuICAgICAgICBtYXBWaWV3LnJlbW92ZU1hcmtlcihzZWxlY3RlZE1hcmtlcik7XG4gICAgICAgIC8vXG4gICAgICAgIGNvbnNvbGUubG9nKFwiWW91IGhhdmUgXCIgKyBjb2xsZWN0ZWRNYXJrZXJzLmxlbmd0aCArIFwiIGNvbGxlY3RlZCBtYXJrZXJzLlwiKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJcXG5NYXJrZXIgdG9vIGZhciBhd2F5LCBtb3ZlIGNsb3Nlci5cIik7XG4gICAgICB9XG5cbiAgfVxuXG4gIGNvbGxlY3QoYW1vdW50LCBtYXJrKSB7XG4gICAgdGhpcy5jcmVhdGVNb2RlbFZpZXcobWFyayk7XG4gIH1cblxuICBhZGRXZW50dXJlUG9pbnRzKG1hcFZpZXcpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHdQb2ludCA9IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpO1xuICAgICAgdmFyIG1hcmtlciA9IG5ldyBtYXBzTW9kdWxlLk1hcmtlcigpO1xuXG4gICAgICBtYXJrZXIucG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyh3UG9pbnQubGF0LCB3UG9pbnQubG5nKTtcbiAgICAgIG1hcmtlci50aXRsZSA9IHdQb2ludC50aXRsZTtcbiAgICAgIG1hcmtlci5zbmlwcGV0ID0gXCJcIjtcbiAgICAgIC8vQW5kcm9pZGlsbGEgdG9pbWlpLiBJb3NpbGxlIHBpdMOkw6Qga2F0c29hIG1pdGVuIHJlc291cmNlIHRvaW1paS4gUEM6bGzDpCBlaSBweXN0eXTDpCB0ZXN0YWFtYWFuXG4gICAgICAvL0lrb25pYSBqb3V0dXUgaGllbW5hIG11b2trYWFtYWFuKHBpZW5lbW3DpGtzaSBqYSBsaXPDpHTDpMOkbiBwaWVuaSBvc29pdGluIGFsYWxhaXRhYW4pXG4gICAgICB2YXIgaWNvbiA9IG5ldyBJbWFnZSgpO1xuICAgICAgaWNvbi5pbWFnZVNvdXJjZSA9IGltYWdlU291cmNlLmZyb21SZXNvdXJjZSgnaWNvbicpO1xuICAgICAgbWFya2VyLmljb24gPSBpY29uO1xuICAgICAgbWFya2VyLmRyYWdnYWJsZSA9IHRydWU7XG4gICAgICBtYXJrZXIudXNlckRhdGEgPSB7aW5kZXg6IDF9O1xuICAgICAgbWFwVmlldy5hZGRNYXJrZXIobWFya2VyKTtcbiAgICB9XG4gIH1cblxuICAvL01hcCBldmVudHNcbiAgb25NYXBSZWFkeSA9IChldmVudCkgPT4ge1xuICAgIHN0YXJ0V2F0Y2goZXZlbnQpO1xuXG4gICAgLy8gQ2hlY2sgaWYgbG9jYXRpb24gc2VydmljZXMgYXJlIGVuYWJsZWRcbiAgICBpZiAoIWdlb2xvY2F0aW9uLmlzRW5hYmxlZCgpKSB7XG4gICAgICAgIGdlb2xvY2F0aW9uLmVuYWJsZUxvY2F0aW9uUmVxdWVzdCgpO1xuICAgIH0gZWxzZSBjb25zb2xlLmxvZyhcIkxvY2F0aW9uIHNlcnZpY2VzIGVuYWJsZWQuXCIpO1xuXG4gICAgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgICB2YXIgZ01hcCA9IG1hcFZpZXcuZ01hcDtcblxuICAgIHRoaXMuYWRkV2VudHVyZVBvaW50cyhtYXBWaWV3KTtcblxuICB9O1xuXG4gIG9uQ29vcmRpbmF0ZVRhcHBlZCA9IChldmVudCkgPT4ge1xuICAgIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG4gICAgdGhpcy53ZW50dXJlUG9pbnRUaXRsZSA9IFwiXCI7XG4gICAgdGhpcy53ZW50dXJlUG9pbnRJbmZvID0gXCJcIjtcbiAgICB0aGlzLm1hcmtlcklzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgfTtcblxuICBvbkNvb3JkaW5hdGVMb25nUHJlc3MgPSAoZXZlbnQpID0+IHtcbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgICB2YXIgbGF0ID0gZXZlbnQucG9zaXRpb24ubGF0aXR1ZGU7XG4gICAgdmFyIGxuZyA9IGV2ZW50LnBvc2l0aW9uLmxvbmdpdHVkZTtcbiAgfTtcblxuICBvbk1hcmtlclNlbGVjdCA9IChldmVudCkgPT4ge1xuXG4gICAgaW50ZXJmYWNlIFBvc2l0aW9uT2JqZWN0IHtcbiAgICAgIFwibGF0aXR1ZGVcIjogc3RyaW5nLFxuICAgICAgXCJsb25naXR1ZGVcIjogc3RyaW5nXG4gICAgfVxuXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG5cbiAgICBsZXQgbWFya2VyUG9zID0gSlNPTi5zdHJpbmdpZnkoZXZlbnQubWFya2VyLnBvc2l0aW9uKTtcbiAgICBsZXQgY3VycmVudFBvcyA9IEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbik7XG4gICAgbGV0IGRpc3RhbmNlID0gZ2V0RGlzdGFuY2VUbyhldmVudC5tYXJrZXIpO1xuXG4gICAgLy8gTWFrZSBib3R0b20gYmFyIHZpc2libGVcbiAgICB0aGlzLm1hcmtlcklzU2VsZWN0ZWQgPSB0cnVlO1xuXG4gICAgLy8gQ2hhbmdlIHRoZSBjb250ZW50IG9mIHRoZSBib3R0b20gYmFyIHRleHRcbiAgICB0aGlzLndlbnR1cmVQb2ludFRpdGxlID0gZXZlbnQubWFya2VyLnRpdGxlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChldmVudC5tYXJrZXIudGl0bGUgPT09IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpLnRpdGxlKSB7XG4gICAgICAgIHRoaXMud2VudHVyZVBvaW50SW5mbyA9IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpLmluZm87XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXZlbnQubWFya2VyLnNuaXBwZXQgPSBcIkRpc3RhbmNlOiBcIiArIGRpc3RhbmNlLnRvRml4ZWQoMCkgKyBcIiBtXCI7XG4gICAgaWYgKGRpc3RhbmNlIDwgNTApIHtcbiAgICAgIHRoaXMuaXNDbG9zZUVub3VnaFRvQ29sbGVjdCA9IHRydWU7XG4gICAgfSBlbHNlIHRoaXMuaXNDbG9zZUVub3VnaFRvQ29sbGVjdCA9IGZhbHNlO1xuXG4gICAgc2VsZWN0ZWRNYXJrZXIgPSBldmVudC5tYXJrZXI7XG5cbiAgfTtcblxuICBvbk1hcmtlckJlZ2luRHJhZ2dpbmcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckJlZ2luRHJhZ2dpbmdcIik7XG4gIH07XG5cbiAgb25NYXJrZXJFbmREcmFnZ2luZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyRW5kRHJhZ2dpbmdcIik7XG4gIH07XG5cbiAgb25NYXJrZXJEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJEcmFnXCIpO1xuICB9O1xuXG4gIG9uQ2FtZXJhQ2hhbmdlZCA9IChldmVudCkgPT4ge1xuICAgIC8vXG4gIH07XG5cbiAgb25TaGFwZVNlbGVjdCA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiU2hhcGUgc2VsZWN0ZWQuXCIpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRXYXRjaChldmVudCkge1xuXG4gIGludGVyZmFjZSBMb2NhdGlvbk9iamVjdCB7XG4gICAgXCJsYXRpdHVkZVwiOiBudW1iZXIsXG4gICAgXCJsb25naXR1ZGVcIjogbnVtYmVyLFxuICAgIFwiYWx0aXR1ZGVcIjogbnVtYmVyLFxuICAgIFwiaG9yaXpvbnRhbEFjY3VyYWN5XCI6IG51bWJlcixcbiAgICBcInZlcnRpY2FsQWNjdXJhY3lcIjogbnVtYmVyLFxuICAgIFwic3BlZWRcIjogbnVtYmVyLFxuICAgIFwiZGlyZWN0aW9uXCI6IG51bWJlcixcbiAgICBcInRpbWVzdGFtcFwiOnN0cmluZ1xuICB9XG5cbiAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG4gIGN1cnJlbnRQb3NDaXJjbGUgPSBuZXcgbWFwc01vZHVsZS5DaXJjbGUoKTtcbiAgY3VycmVudFBvc0NpcmNsZS5jZW50ZXIgPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZygwLCAwKTtcbiAgY3VycmVudFBvc0NpcmNsZS52aXNpYmxlID0gdHJ1ZTtcbiAgY3VycmVudFBvc0NpcmNsZS5yYWRpdXMgPSAyMDtcbiAgY3VycmVudFBvc0NpcmNsZS5maWxsQ29sb3IgPSBuZXcgQ29sb3IoJyM2YzlkZjAnKTtcbiAgY3VycmVudFBvc0NpcmNsZS5zdHJva2VDb2xvciA9IG5ldyBDb2xvcignIzM5NmFiZCcpO1xuICBjdXJyZW50UG9zQ2lyY2xlLnN0cm9rZXdpZHRoID0gMjtcbiAgY3VycmVudFBvc0NpcmNsZS5jbGlja2FibGUgPSB0cnVlO1xuICBtYXBWaWV3LmFkZENpcmNsZShjdXJyZW50UG9zQ2lyY2xlKTtcblxuICB3YXRjaElkID0gZ2VvbG9jYXRpb24ud2F0Y2hMb2NhdGlvbihcbiAgZnVuY3Rpb24gKGxvYykge1xuICAgICAgaWYgKGxvYykge1xuICAgICAgICAgIGxldCBvYmo6IExvY2F0aW9uT2JqZWN0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShsb2MpKTtcbiAgICAgICAgICB0aGlzLmxhdGl0dWRlID0gb2JqLmxhdGl0dWRlO1xuICAgICAgICAgIHRoaXMubG9uZ2l0dWRlID0gb2JqLmxvbmdpdHVkZTtcbiAgICAgICAgICB0aGlzLmFsdGl0dWRlID0gb2JqLmFsdGl0dWRlO1xuICAgICAgICAgIGN1cnJlbnRQb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKG9iai5sYXRpdHVkZSwgb2JqLmxvbmdpdHVkZSk7XG5cbiAgICAgICAgICBjdXJyZW50UG9zQ2lyY2xlLmNlbnRlciA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKHRoaXMubGF0aXR1ZGUsIHRoaXMubG9uZ2l0dWRlKTtcblxuICAgICAgICAgIG1hcFZpZXcubGF0aXR1ZGUgPSB0aGlzLmxhdGl0dWRlO1xuICAgICAgICAgIG1hcFZpZXcubG9uZ2l0dWRlID0gdGhpcy5sb25naXR1ZGU7XG4gICAgICB9XG4gIH0sXG4gIGZ1bmN0aW9uKGUpe1xuICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBlLm1lc3NhZ2UpO1xuICB9LFxuICB7ZGVzaXJlZEFjY3VyYWN5OiAzLCB1cGRhdGVEaXN0YW5jZTogMTAsIG1pbmltdW1VcGRhdGVUaW1lIDogMTAwMCAqIDJ9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZFdhdGNoKCkge1xuICAgIGlmICh3YXRjaElkKSB7XG4gICAgICAgIGdlb2xvY2F0aW9uLmNsZWFyV2F0Y2god2F0Y2hJZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTXkgd2F0Y2ggaXMgZW5kZWQuLi4gVC4gSm9uIFNub3dcIik7XG4gICAgfVxufVxuXG4vLyBUT0RPOiB0b2ltaW1hYW4gYW5kcm9pZGlsbGUga2Fuc3NhXG5mdW5jdGlvbiBnZXREaXN0YW5jZVRvKG9iaikge1xuICBsZXQgb2JqUG9zID0gSlNPTi5zdHJpbmdpZnkob2JqLnBvc2l0aW9uKTtcbiAgbGV0IGN1cnJlbnRQb3MgPSBKU09OLnN0cmluZ2lmeShjdXJyZW50UG9zaXRpb24pO1xuICBsZXQgZGlzdGFuY2UgPSBudWxsO1xuXG4gIGlmKGlzSU9TKSB7XG4gICAgLy9jb25zb2xlLmxvZyhcIlJ1bm5pbmcgb24gaW9zLlwiKVxuICAgIGRpc3RhbmNlID0gZ2VvbG9jYXRpb24uZGlzdGFuY2UoSlNPTi5wYXJzZShvYmpQb3MpLl9pb3MsIEpTT04ucGFyc2UoY3VycmVudFBvcykuX2lvcyk7XG4gIH0gZWxzZSBpZihpc0FuZHJvaWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIlJ1bm5pbmcgb24gYW5kcm9pZC5cIik7XG4gICAgZGlzdGFuY2UgPSAzOy8vZ2VvbG9jYXRpb24uZGlzdGFuY2UoSlNPTi5wYXJzZShvYmpQb3MpLl9hbmRyb2lkLCBKU09OLnBhcnNlKGN1cnJlbnRQb3MpLl9hbmRyb2lkKTtcbiAgfSBlbHNlIHtcbiAgICBkaXN0YW5jZSA9IFwiZXJyb3JcIjtcbiAgICBjb25zb2xlLmxvZyhcIkNvdWxkIG5vdCBmaW5kIGRpc3RhbmNlLlwiKTtcbiAgfVxuICAgIHJldHVybiBkaXN0YW5jZTtcbn1cblxuXG5mdW5jdGlvbiBob3dNYW55Q29sbGVjdGVkKCkge1xuICByZXR1cm4gY29sbGVjdGVkTWFya2Vycy5sZW5ndGggKyAxO1xufVxuXG4vL2hhbmRsZXMgdGhlIGNvbGxlY3Rpb24gYW5kIHJldHVybnMgbWVzc2FnZVxuZnVuY3Rpb24gY29sbGVjdChhbW91bnQsIG1hcmspIHtcbiAgZGlhbG9nc01vZHVsZS5hbGVydCh7XG4gICAgbWVzc2FnZTogXCJXZW50dXJlIHBvaW50IFwiICsgbWFyay50aXRsZSArIFwiIGNvbGxlY3RlZCEgXFxuWW91IGhhdmU6IFwiICsgYW1vdW50LFxuICAgIG9rQnV0dG9uVGV4dDogXCJPS1wiXG4gIH0pO1xufVxuIl19