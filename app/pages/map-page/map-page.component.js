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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBMkY7QUFDM0YscUNBQTRDO0FBQzVDLDBFQUFzRTtBQUN0RSxrRUFBMkY7QUFDM0Ysc0RBQXdEO0FBQ3hELDBDQUF5QztBQUN6QyxnQ0FBK0I7QUFFL0IsK0JBQThCO0FBSTlCLHVGQUFxRjtBQUNyRixtRUFBd0Q7QUFFeEQsMkNBQWtEO0FBRWxELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ3pELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMxQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3RDLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUUxQyxJQUFJLE9BQVksQ0FBQztBQUNqQixJQUFJLGVBQXlCLENBQUM7QUFDOUIsSUFBSSxnQkFBcUIsQ0FBQztBQUMxQixJQUFJLGVBQXVCLENBQUMsQ0FBQyx1REFBdUQ7QUFDcEYsSUFBSSxPQUFZLENBQUM7QUFDakIsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDMUIsSUFBSSxjQUFjLENBQUM7QUFFbkIsa0NBQWUsQ0FBQyxTQUFTLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLE9BQU8sRUFBL0MsQ0FBK0MsQ0FBQyxDQUFDO0FBVWxGLElBQWEsZ0JBQWdCO0lBcUIzQiwwQkFBb0IsTUFBYyxFQUFVLG1CQUF3QyxFQUFVLElBQVUsRUFBVSxhQUFpQyxFQUFVLEtBQXVCO1FBQXBMLGlCQUVDO1FBRm1CLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQVUsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUFVLGtCQUFhLEdBQWIsYUFBYSxDQUFvQjtRQUFVLFVBQUssR0FBTCxLQUFLLENBQWtCO1FBVnBMLGtDQUFrQztRQUMxQixPQUFFLEdBQVcsQ0FBQyxDQUFDO1FBK0N2QixpQ0FBNEIsR0FBRyxVQUFDLEtBQUs7WUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNwQixDQUFDLENBQUM7UUFrRUYsWUFBWTtRQUNaLGVBQVUsR0FBRyxVQUFDLEtBQUs7WUFDakIsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWxCLHlDQUF5QztZQUN6QyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ3hDLENBQUM7WUFBQyxJQUFJO2dCQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUVqRCxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUN2QixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBRXhCLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVqQyxDQUFDLENBQUM7UUFFRix1QkFBa0IsR0FBRyxVQUFDLEtBQUs7WUFDekIsT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDdkIsS0FBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztZQUM1QixLQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1lBQzNCLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFDaEMsQ0FBQyxDQUFDO1FBRUYsMEJBQXFCLEdBQUcsVUFBQyxLQUFLO1lBQzVCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDM0IsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDbEMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7UUFDckMsQ0FBQyxDQUFDO1FBRUYsbUJBQWMsR0FBRyxVQUFDLEtBQUs7WUFPckIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUUzQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNqRCxJQUFJLFFBQVEsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTNDLDBCQUEwQjtZQUMxQixLQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1lBRTdCLDRDQUE0QztZQUM1QyxLQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFFNUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3JFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDakYsS0FBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUMvRSxDQUFDO1lBQ0gsQ0FBQztZQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNqRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbEIsS0FBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztZQUNyQyxDQUFDO1lBQUMsSUFBSTtnQkFBQyxLQUFJLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDO1lBRTNDLGNBQWMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBRWhDLENBQUMsQ0FBQztRQUVGLDBCQUFxQixHQUFHLFVBQUMsS0FBSztZQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDO1FBRUYsd0JBQW1CLEdBQUcsVUFBQyxLQUFLO1lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUM7UUFFRixpQkFBWSxHQUFHLFVBQUMsS0FBSztZQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQztRQUVGLG9CQUFlLEdBQUcsVUFBQyxLQUFLO1lBQ3RCLEVBQUU7UUFDSixDQUFDLENBQUM7UUFFRixrQkFBYSxHQUFHLFVBQUMsS0FBSztZQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDO1FBMUxBLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBVkYsc0JBQUksK0JBQUM7YUFBTDtZQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFDQSwrQ0FBK0M7YUFDaEQsVUFBTSxDQUFTO1lBQ2QsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDWixDQUFDOzs7T0FKRDtJQVVBLG1DQUFRLEdBQVI7UUFBQSxpQkFnQ0M7UUEvQkMsZ0JBQWdCO1FBQ2hCLG1FQUFtRTtRQUNuRSx1Q0FBYSxDQUFDLEtBQUssQ0FBQztZQUNsQixTQUFTLEVBQUUsQ0FBQztvQkFDUixLQUFLLEVBQUUsZUFBZTtpQkFHekIsRUFBRTtvQkFDQyxLQUFLLEVBQUUsUUFBUTtpQkFHbEIsRUFBRTtvQkFDQyxLQUFLLEVBQUUsYUFBYTtpQkFHdkIsRUFBRTtvQkFDQyxLQUFLLEVBQUUsVUFBVTtpQkFHcEIsRUFBRTtvQkFDQyxLQUFLLEVBQUUsU0FBUztpQkFHbkIsQ0FBQztZQUNGLEtBQUssRUFBRSxTQUFTO1lBQ2hCLFFBQVEsRUFBRSx1QkFBdUI7WUFDakMsUUFBUSxFQUFFLFVBQUMsS0FBSztnQkFDWixLQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtZQUNsQixDQUFDO1lBQ0QsT0FBTyxFQUFFLElBQUk7U0FDZCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBTUQsMkNBQWdCLEdBQWhCO1FBQ0UsdUNBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUV6QixDQUFDO0lBR0QsMENBQWUsR0FBZixVQUFnQixJQUFJO1FBQ2xCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixJQUFJLE9BQU8sR0FBdUI7WUFDOUIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDNUIsT0FBTyxFQUFFLElBQUk7WUFDYixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDO1FBQ0Ysc0JBQXNCO1FBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLCtCQUFrQixFQUFFLE9BQU8sQ0FBQzthQUNwRCxJQUFJLENBQUM7WUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztRQUNQLHNCQUFzQjtJQUN4QixDQUFDO0lBRUQsOENBQW1CLEdBQW5CO1FBQ0UsNEVBQTRFO1FBQzVFLDZDQUE2QztRQUM3QywwREFBMEQ7UUFFeEQsZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUNyQixFQUFFLENBQUEsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNuRCxJQUFJLE1BQU0sR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3JDLDJEQUEyRDtZQUMzRCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNyQyxFQUFFO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLHFCQUFxQixDQUFDLENBQUE7UUFDNUUsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1FBQ3JELENBQUM7SUFFTCxDQUFDO0lBRUQsa0NBQU8sR0FBUCxVQUFRLE1BQU0sRUFBRSxJQUFJO1FBQ2xCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELDJDQUFnQixHQUFoQixVQUFpQixPQUFPO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3JFLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0QsSUFBSSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFckMsTUFBTSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pGLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUM1QixNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNwQiw4RkFBOEY7WUFDOUYsb0ZBQW9GO1lBQ3BGLElBQUksSUFBSSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BELE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsRUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFDLENBQUM7WUFDN0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0gsQ0FBQztJQW9GSCx1QkFBQztBQUFELENBQUMsQUFqTkQsSUFpTkM7QUFoTnVCO0lBQXJCLGdCQUFTLENBQUMsU0FBUyxDQUFDOzhCQUFVLGlCQUFVO2lEQUFDO0FBQ2Q7SUFBM0IsZ0JBQVMsQ0FBQyxlQUFlLENBQUM7OEJBQWdCLGlCQUFVO3VEQUFDO0FBRjNDLGdCQUFnQjtJQVI1QixnQkFBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFVBQVU7UUFDcEIsU0FBUyxFQUFFLENBQUMsMENBQW1CLEVBQUUsaUNBQWtCLENBQUM7UUFDcEQsV0FBVyxFQUFFLDhCQUE4QjtRQUMzQyxTQUFTLEVBQUUsQ0FBQyxvQ0FBb0MsRUFBRSw2QkFBNkIsQ0FBQztLQUNqRixDQUFDO3FDQXdCNEIsZUFBTSxFQUErQiwwQ0FBbUIsRUFBZ0IsV0FBSSxFQUF5QixpQ0FBa0IsRUFBaUIsdUJBQWdCO0dBckJ6SyxnQkFBZ0IsQ0FpTjVCO0FBak5ZLDRDQUFnQjtBQW1ON0Isb0JBQTJCLEtBQUs7SUFhOUIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUMzQixnQkFBZ0IsR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUMzQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdkUsZ0JBQWdCLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztJQUNoQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQzdCLGdCQUFnQixDQUFDLFNBQVMsR0FBRyxJQUFJLGFBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNsRCxnQkFBZ0IsQ0FBQyxXQUFXLEdBQUcsSUFBSSxhQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEQsZ0JBQWdCLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztJQUNqQyxnQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ2xDLE9BQU8sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUVwQyxPQUFPLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FDbkMsVUFBVSxHQUFHO1FBQ1QsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNOLElBQUksR0FBRyxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDO1lBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUM3QixlQUFlLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV0RixnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVoRyxPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDakMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLENBQUM7SUFDTCxDQUFDLEVBQ0QsVUFBUyxDQUFDO1FBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUMsRUFDRCxFQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxpQkFBaUIsRUFBRyxJQUFJLEdBQUcsQ0FBQyxFQUFDLENBQUMsQ0FBQztBQUMxRSxDQUFDO0FBM0NELGdDQTJDQztBQUVEO0lBQ0ksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNWLFdBQVcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0lBQ3BELENBQUM7QUFDTCxDQUFDO0FBTEQsNEJBS0M7QUFFRCxxQ0FBcUM7QUFDckMsdUJBQXVCLEdBQUc7SUFDeEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNqRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFFcEIsRUFBRSxDQUFBLENBQUMsZ0JBQUssQ0FBQyxDQUFDLENBQUM7UUFDVCxnQ0FBZ0M7UUFDaEMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQSxDQUFDLG9CQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNuQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUEscUZBQXFGO0lBQ3BHLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFDQyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFFRDtJQUNFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFFRCw0Q0FBNEM7QUFDNUMsaUJBQWlCLE1BQU0sRUFBRSxJQUFJO0lBQzNCLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDbEIsT0FBTyxFQUFFLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsMEJBQTBCLEdBQUcsTUFBTTtRQUM1RSxZQUFZLEVBQUUsSUFBSTtLQUNuQixDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBPbkluaXQsIFZpZXdDaGlsZCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBpc0FuZHJvaWQsIGlzSU9TIH0gZnJvbSBcInBsYXRmb3JtXCI7XG5pbXBvcnQge3JlZ2lzdGVyRWxlbWVudH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL2VsZW1lbnQtcmVnaXN0cnlcIjtcbmltcG9ydCB7IE1vZGFsRGlhbG9nU2VydmljZSwgTW9kYWxEaWFsb2dPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL21vZGFsLWRpYWxvZ1wiO1xuaW1wb3J0ICogYXMgZ2VvbG9jYXRpb24gZnJvbSBcIm5hdGl2ZXNjcmlwdC1nZW9sb2NhdGlvblwiO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gXCJ1aS9wYWdlXCI7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwidWkvYnV0dG9uXCI7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCJjb2xvclwiO1xuLy9pbXBvcnQgeyBJbWFnZSB9IGZyb20gXCJ1aS9pbWFnZVwiO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tIFwiaW1hZ2Utc291cmNlXCI7XG5pbXBvcnQgeyBXZW50dXJlUG9pbnQgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3dlbnR1cmVwb2ludC93ZW50dXJlcG9pbnRcIjtcbmltcG9ydCB7IFdlbnR1cmVQb2ludFNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3dlbnR1cmVwb2ludC93ZW50dXJlcG9pbnQuc2VydmljZVwiO1xuaW1wb3J0IHsgVG5zU2lkZURyYXdlciB9IGZyb20gJ25hdGl2ZXNjcmlwdC1zaWRlZHJhd2VyJztcbmltcG9ydCB7IFRuc1NpZGVEcmF3ZXJPcHRpb25zTGlzdGVuZXIgfSBmcm9tICduYXRpdmVzY3JpcHQtc2lkZWRyYXdlcic7XG5pbXBvcnQgeyBQcml6ZVZpZXdDb21wb25lbnQgfSBmcm9tIFwiLi9wcml6ZS12aWV3XCI7XG5cbnZhciBtYXBzTW9kdWxlID0gcmVxdWlyZShcIm5hdGl2ZXNjcmlwdC1nb29nbGUtbWFwcy1zZGtcIik7XG52YXIgZGlhbG9nc01vZHVsZSA9IHJlcXVpcmUoXCJ1aS9kaWFsb2dzXCIpO1xudmFyIEltYWdlID0gcmVxdWlyZShcInVpL2ltYWdlXCIpLkltYWdlO1xudmFyIGltYWdlU291cmNlID0gcmVxdWlyZShcImltYWdlLXNvdXJjZVwiKTtcblxudmFyIHdhdGNoSWQ6IGFueTtcbnZhciBjdXJyZW50UG9zaXRpb246IExvY2F0aW9uO1xudmFyIGN1cnJlbnRQb3NDaXJjbGU6IGFueTtcbnZhciBjb2xsZWN0RGlzdGFuY2U6IG51bWJlcjsgLy9kaXN0YW5jZSBpbiBtIG9uIGhvdyBjbG9zZSB0byBlbmFibGUgY29sbGVjdC1wcm9wZXJ0eVxudmFyIG1hcFZpZXc6IGFueTtcbnZhciBjb2xsZWN0ZWRNYXJrZXJzID0gW107XG52YXIgc2VsZWN0ZWRNYXJrZXI7XG5cbnJlZ2lzdGVyRWxlbWVudChcIk1hcFZpZXdcIiwgKCkgPT4gcmVxdWlyZShcIm5hdGl2ZXNjcmlwdC1nb29nbGUtbWFwcy1zZGtcIikuTWFwVmlldyk7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogXCJtYXAtcGFnZVwiLFxuICBwcm92aWRlcnM6IFtXZW50dXJlUG9pbnRTZXJ2aWNlLCBNb2RhbERpYWxvZ1NlcnZpY2VdLFxuICB0ZW1wbGF0ZVVybDogXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS5odG1sXCIsXG4gIHN0eWxlVXJsczogW1wicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UtY29tbW9uLmNzc1wiLCBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmNzc1wiXVxufSlcblxuXG5leHBvcnQgY2xhc3MgTWFwUGFnZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBWaWV3Q2hpbGQoXCJNYXBWaWV3XCIpIG1hcFZpZXc6IEVsZW1lbnRSZWY7XG4gIEBWaWV3Q2hpbGQoXCJjb2xsZWN0QnV0dG9uXCIpIGNvbGxlY3RCdXR0b246IEVsZW1lbnRSZWY7XG5cbiAgbGF0aXR1ZGU6IG51bWJlcjtcbiAgbG9uZ2l0dWRlOiBudW1iZXI7XG4gIGFsdGl0dWRlOiBudW1iZXI7XG4gIHdlbnR1cmVQb2ludFRpdGxlOiBzdHJpbmc7XG4gIHdlbnR1cmVQb2ludEluZm86IHN0cmluZztcbiAgbWFya2VySXNTZWxlY3RlZDogYm9vbGVhbjtcbiAgaXNDbG9zZUVub3VnaFRvQ29sbGVjdDogYm9vbGVhbjtcbiAgLy9pIHN0b3JlcyB0aGUgaW5kZXggdmFsdWUgb2YgbWVudVxuICBwcml2YXRlIF9pOiBudW1iZXIgPSAwO1xuXHRnZXQgaSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9pO1xuXHR9XG4gIC8vdMOkaMOkbiBrYWlra2kgbWl0w6QgaGFsdXRhYW4gdGFwYWh0dXZhbiBtZW51c3RhXG5cdHNldCBpKGk6IG51bWJlcikge1xuXHRcdHRoaXMuX2kgPSBpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByb3V0ZXI6IFJvdXRlciwgcHJpdmF0ZSB3ZW50dXJlUG9pbnRTZXJ2aWNlOiBXZW50dXJlUG9pbnRTZXJ2aWNlLCBwcml2YXRlIHBhZ2U6IFBhZ2UsIHByaXZhdGUgX21vZGFsU2VydmljZTogTW9kYWxEaWFsb2dTZXJ2aWNlLCBwcml2YXRlIHZjUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7XG4gICAgdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLnBvcHVsYXRlKCk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBUT0RPOiBMb2FkZXI/XG4gICAgLy8gVE9ETzogbWVudWl0ZW0gaWNvbml0IHB1dXR0dXUsIGFjdGlvbmJhcmluIG1haGQgcGlpbG90dGFtaW5lbig/KVxuICAgIFRuc1NpZGVEcmF3ZXIuYnVpbGQoe1xuICAgICAgdGVtcGxhdGVzOiBbe1xuICAgICAgICAgIHRpdGxlOiAnV2VudHVyZXBvaW50cycsXG4gICAgICAgICAgLy9hbmRyb2lkSWNvbjogJ2ljX2hvbWVfd2hpdGVfMjRkcCcsXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfaG9tZV93aGl0ZScsXG4gICAgICB9LCB7XG4gICAgICAgICAgdGl0bGU6ICdSb3V0ZXMnLFxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19nYXZlbF93aGl0ZV8yNGRwJyxcbiAgICAgICAgICAvL2lvc0ljb246ICdpY19nYXZlbF93aGl0ZScsXG4gICAgICB9LCB7XG4gICAgICAgICAgdGl0bGU6ICdNeSBXZW50dXJlcycsXG4gICAgICAgICAgLy9hbmRyb2lkSWNvbjogJ2ljX2FjY291bnRfYmFsYW5jZV93aGl0ZV8yNGRwJyxcbiAgICAgICAgICAvL2lvc0ljb246ICdpY19hY2NvdW50X2JhbGFuY2Vfd2hpdGUnLFxuICAgICAgfSwge1xuICAgICAgICAgIHRpdGxlOiAnU2V0dGluZ3MnLFxuICAgICAgICAvLyAgYW5kcm9pZEljb246ICdpY19idWlsZF93aGl0ZV8yNGRwJyxcbiAgICAgICAgLy8gIGlvc0ljb246ICdpY19idWlsZF93aGl0ZScsXG4gICAgICB9LCB7XG4gICAgICAgICAgdGl0bGU6ICdMb2cgb3V0JyxcbiAgICAgICAgLy8gIGFuZHJvaWRJY29uOiAnaWNfYWNjb3VudF9jaXJjbGVfd2hpdGVfMjRkcCcsXG4gICAgICAgIC8vICBpb3NJY29uOiAnaWNfYWNjb3VudF9jaXJjbGVfd2hpdGUnLFxuICAgICAgfV0sXG4gICAgICB0aXRsZTogJ1dlbnR1cmUnLFxuICAgICAgc3VidGl0bGU6ICd5b3VyIHVyYmFuIGFkdmVudHVyZSEnLFxuICAgICAgbGlzdGVuZXI6IChpbmRleCkgPT4ge1xuICAgICAgICAgIHRoaXMuaSA9IGluZGV4XG4gICAgICB9LFxuICAgICAgY29udGV4dDogdGhpcyxcbiAgICB9KTtcbiAgfVxuXG4gIFRuc1NpZGVEcmF3ZXJPcHRpb25zTGlzdGVuZXIgPSAoaW5kZXgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhpbmRleClcbiAgfTtcblxuICB0b2dnbGVTaWRlRHJhd2VyKCkge1xuICAgIFRuc1NpZGVEcmF3ZXIudG9nZ2xlKCk7XG5cbiAgfVxuXG5cbiAgY3JlYXRlTW9kZWxWaWV3KG1hcmspIHtcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IG9wdGlvbnM6IE1vZGFsRGlhbG9nT3B0aW9ucyA9IHtcbiAgICAgICAgdmlld0NvbnRhaW5lclJlZjogdGhpcy52Y1JlZixcbiAgICAgICAgY29udGV4dDogbWFyayxcbiAgICAgICAgZnVsbHNjcmVlbjogdHJ1ZVxuICAgIH07XG4gICAgLy8gPj4gcmV0dXJuaW5nLXJlc3VsdFxuICAgIHRoaXMuX21vZGFsU2VydmljZS5zaG93TW9kYWwoUHJpemVWaWV3Q29tcG9uZW50LCBvcHRpb25zKVxuICAgICAgICAudGhlbigoLyogKi8pID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1hcmsudGl0bGUpO1xuICAgICAgICB9KTtcbiAgICAvLyA8PCByZXR1cm5pbmctcmVzdWx0XG4gIH1cblxuICBjb2xsZWN0QnV0dG9uVGFwcGVkKCkge1xuICAgIC8vIFRPRE86IFTDpGjDpG4gc2Uga2Vyw6R5c3RvaW1pbnRvLCBpZiBkaXN0YW5jZSBqdG4sIG5paW4gdHVvbHRhIHRvaSBjb2xsZWN0KClcbiAgICAvLyBUaGlzIG1pZ2h0IGJlIHN0dXBpZCwgYnV0IHdvcmtzIGZvciBub3cgOilcbiAgICAvL1RPRE86IGFkZGluZyBjb2xsZWN0ZWQgbWFya2VyIHRvIGEgbGlzdCBldGMuIGI0IHJlbW92aW5nXG5cbiAgICAgIGNvbGxlY3REaXN0YW5jZSA9IDUwO1xuICAgICAgaWYoZ2V0RGlzdGFuY2VUbyhzZWxlY3RlZE1hcmtlcikgPCBjb2xsZWN0RGlzdGFuY2UpIHtcbiAgICAgICAgbGV0IGFtb3VudCA9IGhvd01hbnlDb2xsZWN0ZWQoKTtcbiAgICAgICAgdGhpcy5jb2xsZWN0KGFtb3VudCwgc2VsZWN0ZWRNYXJrZXIpO1xuICAgICAgICAvL2FsZXJ0KFwiVmVudHVyZSBwb2ludCBjb2xsZWN0ZWQuIFxcbkNvbGxlY3RlZDogXCIgKyBhbW91bnQpO1xuICAgICAgICBjb2xsZWN0ZWRNYXJrZXJzLnB1c2goc2VsZWN0ZWRNYXJrZXIpO1xuICAgICAgICBtYXBWaWV3LnJlbW92ZU1hcmtlcihzZWxlY3RlZE1hcmtlcik7XG4gICAgICAgIC8vXG4gICAgICAgIGNvbnNvbGUubG9nKFwiWW91IGhhdmUgXCIgKyBjb2xsZWN0ZWRNYXJrZXJzLmxlbmd0aCArIFwiIGNvbGxlY3RlZCBtYXJrZXJzLlwiKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJcXG5NYXJrZXIgdG9vIGZhciBhd2F5LCBtb3ZlIGNsb3Nlci5cIik7XG4gICAgICB9XG5cbiAgfVxuXG4gIGNvbGxlY3QoYW1vdW50LCBtYXJrKSB7XG4gICAgdGhpcy5jcmVhdGVNb2RlbFZpZXcobWFyayk7XG4gIH1cblxuICBhZGRXZW50dXJlUG9pbnRzKG1hcFZpZXcpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHdQb2ludCA9IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpO1xuICAgICAgdmFyIG1hcmtlciA9IG5ldyBtYXBzTW9kdWxlLk1hcmtlcigpO1xuXG4gICAgICBtYXJrZXIucG9zaXRpb24gPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZyh3UG9pbnQubGF0LCB3UG9pbnQubG5nKTtcbiAgICAgIG1hcmtlci50aXRsZSA9IHdQb2ludC50aXRsZTtcbiAgICAgIG1hcmtlci5zbmlwcGV0ID0gXCJcIjtcbiAgICAgIC8vQW5kcm9pZGlsbGEgdG9pbWlpLiBJb3NpbGxlIHBpdMOkw6Qga2F0c29hIG1pdGVuIHJlc291cmNlIHRvaW1paS4gUEM6bGzDpCBlaSBweXN0eXTDpCB0ZXN0YWFtYWFuXG4gICAgICAvL0lrb25pYSBqb3V0dXUgaGllbW5hIG11b2trYWFtYWFuKHBpZW5lbW3DpGtzaSBqYSBsaXPDpHTDpMOkbiBwaWVuaSBvc29pdGluIGFsYWxhaXRhYW4pXG4gICAgICB2YXIgaWNvbiA9IG5ldyBJbWFnZSgpO1xuICAgICAgaWNvbi5pbWFnZVNvdXJjZSA9IGltYWdlU291cmNlLmZyb21SZXNvdXJjZSgnaWNvbicpO1xuICAgICAgbWFya2VyLmljb24gPSBpY29uO1xuICAgICAgbWFya2VyLmRyYWdnYWJsZSA9IHRydWU7XG4gICAgICBtYXJrZXIudXNlckRhdGEgPSB7aW5kZXg6IDF9O1xuICAgICAgbWFwVmlldy5hZGRNYXJrZXIobWFya2VyKTtcbiAgICB9XG4gIH1cblxuICAvL01hcCBldmVudHNcbiAgb25NYXBSZWFkeSA9IChldmVudCkgPT4ge1xuICAgIHN0YXJ0V2F0Y2goZXZlbnQpO1xuXG4gICAgLy8gQ2hlY2sgaWYgbG9jYXRpb24gc2VydmljZXMgYXJlIGVuYWJsZWRcbiAgICBpZiAoIWdlb2xvY2F0aW9uLmlzRW5hYmxlZCgpKSB7XG4gICAgICAgIGdlb2xvY2F0aW9uLmVuYWJsZUxvY2F0aW9uUmVxdWVzdCgpO1xuICAgIH0gZWxzZSBjb25zb2xlLmxvZyhcIkxvY2F0aW9uIHNlcnZpY2VzIGVuYWJsZWQuXCIpO1xuXG4gICAgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgICB2YXIgZ01hcCA9IG1hcFZpZXcuZ01hcDtcblxuICAgIHRoaXMuYWRkV2VudHVyZVBvaW50cyhtYXBWaWV3KTtcblxuICB9O1xuXG4gIG9uQ29vcmRpbmF0ZVRhcHBlZCA9IChldmVudCkgPT4ge1xuICAgIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG4gICAgdGhpcy53ZW50dXJlUG9pbnRUaXRsZSA9IFwiXCI7XG4gICAgdGhpcy53ZW50dXJlUG9pbnRJbmZvID0gXCJcIjtcbiAgICB0aGlzLm1hcmtlcklzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgfTtcblxuICBvbkNvb3JkaW5hdGVMb25nUHJlc3MgPSAoZXZlbnQpID0+IHtcbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgICB2YXIgbGF0ID0gZXZlbnQucG9zaXRpb24ubGF0aXR1ZGU7XG4gICAgdmFyIGxuZyA9IGV2ZW50LnBvc2l0aW9uLmxvbmdpdHVkZTtcbiAgfTtcblxuICBvbk1hcmtlclNlbGVjdCA9IChldmVudCkgPT4ge1xuXG4gICAgaW50ZXJmYWNlIFBvc2l0aW9uT2JqZWN0IHtcbiAgICAgIFwibGF0aXR1ZGVcIjogc3RyaW5nLFxuICAgICAgXCJsb25naXR1ZGVcIjogc3RyaW5nXG4gICAgfVxuXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG5cbiAgICBsZXQgbWFya2VyUG9zID0gSlNPTi5zdHJpbmdpZnkoZXZlbnQubWFya2VyLnBvc2l0aW9uKTtcbiAgICBsZXQgY3VycmVudFBvcyA9IEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbik7XG4gICAgbGV0IGRpc3RhbmNlID0gZ2V0RGlzdGFuY2VUbyhldmVudC5tYXJrZXIpO1xuXG4gICAgLy8gTWFrZSBib3R0b20gYmFyIHZpc2libGVcbiAgICB0aGlzLm1hcmtlcklzU2VsZWN0ZWQgPSB0cnVlO1xuXG4gICAgLy8gQ2hhbmdlIHRoZSBjb250ZW50IG9mIHRoZSBib3R0b20gYmFyIHRleHRcbiAgICB0aGlzLndlbnR1cmVQb2ludFRpdGxlID0gZXZlbnQubWFya2VyLnRpdGxlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChldmVudC5tYXJrZXIudGl0bGUgPT09IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpLnRpdGxlKSB7XG4gICAgICAgIHRoaXMud2VudHVyZVBvaW50SW5mbyA9IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5nZXRJdGVtKGkpLmluZm87XG4gICAgICB9XG4gICAgfVxuXG4gICAgZXZlbnQubWFya2VyLnNuaXBwZXQgPSBcIkRpc3RhbmNlOiBcIiArIGRpc3RhbmNlLnRvRml4ZWQoMCkgKyBcIiBtXCI7XG4gICAgaWYgKGRpc3RhbmNlIDwgNTApIHtcbiAgICAgIHRoaXMuaXNDbG9zZUVub3VnaFRvQ29sbGVjdCA9IHRydWU7XG4gICAgfSBlbHNlIHRoaXMuaXNDbG9zZUVub3VnaFRvQ29sbGVjdCA9IGZhbHNlO1xuXG4gICAgc2VsZWN0ZWRNYXJrZXIgPSBldmVudC5tYXJrZXI7XG5cbiAgfTtcblxuICBvbk1hcmtlckJlZ2luRHJhZ2dpbmcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckJlZ2luRHJhZ2dpbmdcIik7XG4gIH07XG5cbiAgb25NYXJrZXJFbmREcmFnZ2luZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyRW5kRHJhZ2dpbmdcIik7XG4gIH07XG5cbiAgb25NYXJrZXJEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJEcmFnXCIpO1xuICB9O1xuXG4gIG9uQ2FtZXJhQ2hhbmdlZCA9IChldmVudCkgPT4ge1xuICAgIC8vXG4gIH07XG5cbiAgb25TaGFwZVNlbGVjdCA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiU2hhcGUgc2VsZWN0ZWQuXCIpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRXYXRjaChldmVudCkge1xuXG4gIGludGVyZmFjZSBMb2NhdGlvbk9iamVjdCB7XG4gICAgXCJsYXRpdHVkZVwiOiBudW1iZXIsXG4gICAgXCJsb25naXR1ZGVcIjogbnVtYmVyLFxuICAgIFwiYWx0aXR1ZGVcIjogbnVtYmVyLFxuICAgIFwiaG9yaXpvbnRhbEFjY3VyYWN5XCI6IG51bWJlcixcbiAgICBcInZlcnRpY2FsQWNjdXJhY3lcIjogbnVtYmVyLFxuICAgIFwic3BlZWRcIjogbnVtYmVyLFxuICAgIFwiZGlyZWN0aW9uXCI6IG51bWJlcixcbiAgICBcInRpbWVzdGFtcFwiOnN0cmluZ1xuICB9XG5cbiAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG4gIGN1cnJlbnRQb3NDaXJjbGUgPSBuZXcgbWFwc01vZHVsZS5DaXJjbGUoKTtcbiAgY3VycmVudFBvc0NpcmNsZS5jZW50ZXIgPSBtYXBzTW9kdWxlLlBvc2l0aW9uLnBvc2l0aW9uRnJvbUxhdExuZygwLCAwKTtcbiAgY3VycmVudFBvc0NpcmNsZS52aXNpYmxlID0gdHJ1ZTtcbiAgY3VycmVudFBvc0NpcmNsZS5yYWRpdXMgPSAyMDtcbiAgY3VycmVudFBvc0NpcmNsZS5maWxsQ29sb3IgPSBuZXcgQ29sb3IoJyM2YzlkZjAnKTtcbiAgY3VycmVudFBvc0NpcmNsZS5zdHJva2VDb2xvciA9IG5ldyBDb2xvcignIzM5NmFiZCcpO1xuICBjdXJyZW50UG9zQ2lyY2xlLnN0cm9rZXdpZHRoID0gMjtcbiAgY3VycmVudFBvc0NpcmNsZS5jbGlja2FibGUgPSB0cnVlO1xuICBtYXBWaWV3LmFkZENpcmNsZShjdXJyZW50UG9zQ2lyY2xlKTtcblxuICB3YXRjaElkID0gZ2VvbG9jYXRpb24ud2F0Y2hMb2NhdGlvbihcbiAgZnVuY3Rpb24gKGxvYykge1xuICAgICAgaWYgKGxvYykge1xuICAgICAgICAgIGxldCBvYmo6IExvY2F0aW9uT2JqZWN0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShsb2MpKTtcbiAgICAgICAgICB0aGlzLmxhdGl0dWRlID0gb2JqLmxhdGl0dWRlO1xuICAgICAgICAgIHRoaXMubG9uZ2l0dWRlID0gb2JqLmxvbmdpdHVkZTtcbiAgICAgICAgICB0aGlzLmFsdGl0dWRlID0gb2JqLmFsdGl0dWRlO1xuICAgICAgICAgIGN1cnJlbnRQb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKG9iai5sYXRpdHVkZSwgb2JqLmxvbmdpdHVkZSk7XG5cbiAgICAgICAgICBjdXJyZW50UG9zQ2lyY2xlLmNlbnRlciA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKHRoaXMubGF0aXR1ZGUsIHRoaXMubG9uZ2l0dWRlKTtcblxuICAgICAgICAgIG1hcFZpZXcubGF0aXR1ZGUgPSB0aGlzLmxhdGl0dWRlO1xuICAgICAgICAgIG1hcFZpZXcubG9uZ2l0dWRlID0gdGhpcy5sb25naXR1ZGU7XG4gICAgICB9XG4gIH0sXG4gIGZ1bmN0aW9uKGUpe1xuICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBlLm1lc3NhZ2UpO1xuICB9LFxuICB7ZGVzaXJlZEFjY3VyYWN5OiAzLCB1cGRhdGVEaXN0YW5jZTogMTAsIG1pbmltdW1VcGRhdGVUaW1lIDogMTAwMCAqIDJ9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZFdhdGNoKCkge1xuICAgIGlmICh3YXRjaElkKSB7XG4gICAgICAgIGdlb2xvY2F0aW9uLmNsZWFyV2F0Y2god2F0Y2hJZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTXkgd2F0Y2ggaXMgZW5kZWQuLi4gVC4gSm9uIFNub3dcIik7XG4gICAgfVxufVxuXG4vLyBUT0RPOiB0b2ltaW1hYW4gYW5kcm9pZGlsbGUga2Fuc3NhXG5mdW5jdGlvbiBnZXREaXN0YW5jZVRvKG9iaikge1xuICBsZXQgb2JqUG9zID0gSlNPTi5zdHJpbmdpZnkob2JqLnBvc2l0aW9uKTtcbiAgbGV0IGN1cnJlbnRQb3MgPSBKU09OLnN0cmluZ2lmeShjdXJyZW50UG9zaXRpb24pO1xuICBsZXQgZGlzdGFuY2UgPSBudWxsO1xuXG4gIGlmKGlzSU9TKSB7XG4gICAgLy9jb25zb2xlLmxvZyhcIlJ1bm5pbmcgb24gaW9zLlwiKVxuICAgIGRpc3RhbmNlID0gZ2VvbG9jYXRpb24uZGlzdGFuY2UoSlNPTi5wYXJzZShvYmpQb3MpLl9pb3MsIEpTT04ucGFyc2UoY3VycmVudFBvcykuX2lvcyk7XG4gIH0gZWxzZSBpZihpc0FuZHJvaWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIlJ1bm5pbmcgb24gYW5kcm9pZC5cIik7XG4gICAgZGlzdGFuY2UgPSAzOy8vZ2VvbG9jYXRpb24uZGlzdGFuY2UoSlNPTi5wYXJzZShvYmpQb3MpLl9hbmRyb2lkLCBKU09OLnBhcnNlKGN1cnJlbnRQb3MpLl9hbmRyb2lkKTtcbiAgfSBlbHNlIHtcbiAgICBkaXN0YW5jZSA9IFwiZXJyb3JcIjtcbiAgICBjb25zb2xlLmxvZyhcIkNvdWxkIG5vdCBmaW5kIGRpc3RhbmNlLlwiKTtcbiAgfVxuICAgIHJldHVybiBkaXN0YW5jZTtcbn1cblxuZnVuY3Rpb24gaG93TWFueUNvbGxlY3RlZCgpIHtcbiAgcmV0dXJuIGNvbGxlY3RlZE1hcmtlcnMubGVuZ3RoICsgMTtcbn1cblxuLy9oYW5kbGVzIHRoZSBjb2xsZWN0aW9uIGFuZCByZXR1cm5zIG1lc3NhZ2VcbmZ1bmN0aW9uIGNvbGxlY3QoYW1vdW50LCBtYXJrKSB7XG4gIGRpYWxvZ3NNb2R1bGUuYWxlcnQoe1xuICAgIG1lc3NhZ2U6IFwiV2VudHVyZSBwb2ludCBcIiArIG1hcmsudGl0bGUgKyBcIiBjb2xsZWN0ZWQhIFxcbllvdSBoYXZlOiBcIiArIGFtb3VudCxcbiAgICBva0J1dHRvblRleHQ6IFwiT0tcIlxuICB9KTtcbn1cbiJdfQ==