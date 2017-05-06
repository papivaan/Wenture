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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBMkY7QUFDM0YscUNBQTRDO0FBQzVDLDBFQUFzRTtBQUN0RSxrRUFBMkY7QUFDM0Ysc0RBQXdEO0FBQ3hELHVFQUErRDtBQUMvRCwwQ0FBeUM7QUFDekMsZ0NBQStCO0FBRS9CLCtCQUE4QjtBQUk5Qix1RkFBcUY7QUFDckYsbUVBQXdEO0FBRXhELDJDQUFrRDtBQUVsRCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUN6RCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDMUMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN0QyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFMUMsSUFBSSxPQUFZLENBQUM7QUFDakIsSUFBSSxlQUF5QixDQUFDO0FBQzlCLElBQUksZ0JBQXFCLENBQUM7QUFDMUIsSUFBSSxlQUF1QixDQUFDLENBQUMsdURBQXVEO0FBQ3BGLElBQUksT0FBWSxDQUFDO0FBQ2pCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzFCLElBQUksY0FBYyxDQUFDO0FBRW5CLGtDQUFlLENBQUMsU0FBUyxFQUFFLGNBQU0sT0FBQSxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQyxPQUFPLEVBQS9DLENBQStDLENBQUMsQ0FBQztBQVVsRixJQUFhLGdCQUFnQjtJQWtDM0IsMEJBQW9CLE1BQWMsRUFBVSxRQUE0QixFQUFVLG1CQUF3QyxFQUFVLElBQVUsRUFBVSxhQUFpQyxFQUFVLEtBQXVCO1FBQTFOLGlCQUVDO1FBRm1CLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFvQjtRQUFVLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFNO1FBQVUsa0JBQWEsR0FBYixhQUFhLENBQW9CO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBa0I7UUF2QjFOLGtDQUFrQztRQUMxQixPQUFFLEdBQVcsQ0FBQyxDQUFDO1FBNER2QixpQ0FBNEIsR0FBRyxVQUFDLEtBQUs7WUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNwQixDQUFDLENBQUM7UUFpRUYsWUFBWTtRQUNaLGVBQVUsR0FBRyxVQUFDLEtBQUs7WUFDakIsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWxCLHlDQUF5QztZQUN6QyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ3hDLENBQUM7WUFBQyxJQUFJO2dCQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUVqRCxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUN2QixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBRXhCLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVqQyxDQUFDLENBQUM7UUFFRix1QkFBa0IsR0FBRyxVQUFDLEtBQUs7WUFDekIsT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDdkIsS0FBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztZQUM1QixLQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1lBQzNCLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFDaEMsQ0FBQyxDQUFDO1FBRUYsMEJBQXFCLEdBQUcsVUFBQyxLQUFLO1lBQzVCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDM0IsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDbEMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7UUFDckMsQ0FBQyxDQUFDO1FBRUYsbUJBQWMsR0FBRyxVQUFDLEtBQUs7WUFPckIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUUzQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNqRCxJQUFJLFFBQVEsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTNDLDBCQUEwQjtZQUMxQixLQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1lBRTdCLDRDQUE0QztZQUM1QyxLQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFFNUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3JFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDakYsS0FBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUMvRSxDQUFDO1lBQ0gsQ0FBQztZQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNqRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbEIsS0FBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztZQUNyQyxDQUFDO1lBQUMsSUFBSTtnQkFBQyxLQUFJLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDO1lBRTNDLGNBQWMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBRWhDLENBQUMsQ0FBQztRQUVGLDBCQUFxQixHQUFHLFVBQUMsS0FBSztZQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDO1FBRUYsd0JBQW1CLEdBQUcsVUFBQyxLQUFLO1lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUM7UUFFRixpQkFBWSxHQUFHLFVBQUMsS0FBSztZQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQztRQUVGLG9CQUFlLEdBQUcsVUFBQyxLQUFLO1lBQ3RCLEVBQUU7UUFDSixDQUFDLENBQUM7UUFFRixrQkFBYSxHQUFHLFVBQUMsS0FBSztZQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDO1FBekxBLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBdkJGLHNCQUFJLCtCQUFDO2FBQUw7WUFDQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNoQixDQUFDO1FBQ0Esa0RBQWtEO2FBQ25ELFVBQU0sQ0FBUztZQUNkLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV2QixDQUFDOzs7T0FORDtJQU9GLDhCQUE4QjtJQUM1Qix1Q0FBWSxHQUFaLFVBQWEsQ0FBQztRQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZixFQUFFLENBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNWLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFBQSxDQUFDO1FBRUYsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUFBLENBQUM7SUFDSixDQUFDO0lBTUQsbUNBQVEsR0FBUjtRQUFBLGlCQWdDQztRQS9CQyxnQkFBZ0I7UUFDaEIsbUVBQW1FO1FBQ25FLHVDQUFhLENBQUMsS0FBSyxDQUFDO1lBQ2xCLFNBQVMsRUFBRSxDQUFDO29CQUNSLEtBQUssRUFBRSxlQUFlO2lCQUd6QixFQUFFO29CQUNDLEtBQUssRUFBRSxRQUFRO2lCQUdsQixFQUFFO29CQUNDLEtBQUssRUFBRSxhQUFhO2lCQUd2QixFQUFFO29CQUNDLEtBQUssRUFBRSxVQUFVO2lCQUdwQixFQUFFO29CQUNDLEtBQUssRUFBRSxTQUFTO2lCQUduQixDQUFDO1lBQ0YsS0FBSyxFQUFFLFNBQVM7WUFDaEIsUUFBUSxFQUFFLHVCQUF1QjtZQUNqQyxRQUFRLEVBQUUsVUFBQyxLQUFLO2dCQUNaLEtBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1lBQ2xCLENBQUM7WUFDRCxPQUFPLEVBQUUsSUFBSTtTQUNkLENBQUMsQ0FBQztJQUNMLENBQUM7SUFNRCwyQ0FBZ0IsR0FBaEI7UUFDRSx1Q0FBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFHRCwwQ0FBZSxHQUFmLFVBQWdCLElBQUk7UUFBcEIsaUJBYUM7UUFaQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFDaEIsSUFBSSxPQUFPLEdBQXVCO1lBQzlCLGdCQUFnQixFQUFFLElBQUksQ0FBQyxLQUFLO1lBQzVCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQztRQUNGLHNCQUFzQjtRQUN0QixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQywrQkFBa0IsRUFBRSxPQUFPLENBQUM7YUFDcEQsSUFBSSxDQUFDO1lBQ0YsS0FBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztRQUNQLHNCQUFzQjtJQUN4QixDQUFDO0lBRUQsOENBQW1CLEdBQW5CO1FBQ0UsNEVBQTRFO1FBQzVFLDZDQUE2QztRQUM3QywwREFBMEQ7UUFFeEQsZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUNyQixFQUFFLENBQUEsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNuRCxJQUFJLE1BQU0sR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3JDLDJEQUEyRDtZQUMzRCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNyQyxFQUFFO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLHFCQUFxQixDQUFDLENBQUE7UUFDNUUsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1FBQ3JELENBQUM7SUFFTCxDQUFDO0lBRUQsa0NBQU8sR0FBUCxVQUFRLE1BQU0sRUFBRSxJQUFJO1FBQ2xCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELDJDQUFnQixHQUFoQixVQUFpQixPQUFPO1FBQ3RCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3JFLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0QsSUFBSSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFckMsTUFBTSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pGLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUM1QixNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNwQiw4RkFBOEY7WUFDOUYsb0ZBQW9GO1lBQ3BGLElBQUksSUFBSSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BELE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsRUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFDLENBQUM7WUFDN0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0gsQ0FBQztJQW9GSCx1QkFBQztBQUFELENBQUMsQUE3TkQsSUE2TkM7QUE1TnVCO0lBQXJCLGdCQUFTLENBQUMsU0FBUyxDQUFDOzhCQUFVLGlCQUFVO2lEQUFDO0FBQ2Q7SUFBM0IsZ0JBQVMsQ0FBQyxlQUFlLENBQUM7OEJBQWdCLGlCQUFVO3VEQUFDO0FBRjNDLGdCQUFnQjtJQVI1QixnQkFBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFVBQVU7UUFDcEIsU0FBUyxFQUFFLENBQUMsMENBQW1CLEVBQUUsaUNBQWtCLENBQUM7UUFDcEQsV0FBVyxFQUFFLDhCQUE4QjtRQUMzQyxTQUFTLEVBQUUsQ0FBQyxvQ0FBb0MsRUFBRSw2QkFBNkIsQ0FBQztLQUNqRixDQUFDO3FDQXFDNEIsZUFBTSxFQUFvQiw4Q0FBa0IsRUFBK0IsMENBQW1CLEVBQWdCLFdBQUksRUFBeUIsaUNBQWtCLEVBQWlCLHVCQUFnQjtHQWxDL00sZ0JBQWdCLENBNk41QjtBQTdOWSw0Q0FBZ0I7QUErTjdCLG9CQUEyQixLQUFLO0lBYTlCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDM0IsZ0JBQWdCLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDM0MsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLGdCQUFnQixDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDaEMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUM3QixnQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsSUFBSSxhQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEQsZ0JBQWdCLENBQUMsV0FBVyxHQUFHLElBQUksYUFBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BELGdCQUFnQixDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDakMsZ0JBQWdCLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUNsQyxPQUFPLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFcEMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQ25DLFVBQVUsR0FBRztRQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDTixJQUFJLEdBQUcsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztZQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDN0IsZUFBZSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdEYsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFaEcsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2pDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN2QyxDQUFDO0lBQ0wsQ0FBQyxFQUNELFVBQVMsQ0FBQztRQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2QyxDQUFDLEVBQ0QsRUFBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsaUJBQWlCLEVBQUcsSUFBSSxHQUFHLENBQUMsRUFBQyxDQUFDLENBQUM7QUFDMUUsQ0FBQztBQTNDRCxnQ0EyQ0M7QUFFRDtJQUNJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDVixXQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztJQUNwRCxDQUFDO0FBQ0wsQ0FBQztBQUxELDRCQUtDO0FBRUQscUNBQXFDO0FBQ3JDLHVCQUF1QixHQUFHO0lBQ3hCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDakQsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBRXBCLEVBQUUsQ0FBQSxDQUFDLGdCQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ1QsZ0NBQWdDO1FBQ2hDLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEYsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUEsQ0FBQyxvQkFBUyxDQUFDLENBQUMsQ0FBQztRQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDbkMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFBLHFGQUFxRjtJQUNwRyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ0MsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNwQixDQUFDO0FBR0Q7SUFDRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQsNENBQTRDO0FBQzVDLGlCQUFpQixNQUFNLEVBQUUsSUFBSTtJQUMzQixhQUFhLENBQUMsS0FBSyxDQUFDO1FBQ2xCLE9BQU8sRUFBRSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLDBCQUEwQixHQUFHLE1BQU07UUFDNUUsWUFBWSxFQUFFLElBQUk7S0FDbkIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3Q2hpbGQsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgaXNBbmRyb2lkLCBpc0lPUyB9IGZyb20gXCJwbGF0Zm9ybVwiO1xuaW1wb3J0IHtyZWdpc3RlckVsZW1lbnR9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9lbGVtZW50LXJlZ2lzdHJ5XCI7XG5pbXBvcnQgeyBNb2RhbERpYWxvZ1NlcnZpY2UsIE1vZGFsRGlhbG9nT3B0aW9ucyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9tb2RhbC1kaWFsb2dcIjtcbmltcG9ydCAqIGFzIGdlb2xvY2F0aW9uIGZyb20gXCJuYXRpdmVzY3JpcHQtZ2VvbG9jYXRpb25cIjtcbmltcG9ydCB7IFROU0ZvbnRJY29uU2VydmljZSB9IGZyb20gJ25hdGl2ZXNjcmlwdC1uZ3gtZm9udGljb24nO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gXCJ1aS9wYWdlXCI7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwidWkvYnV0dG9uXCI7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCJjb2xvclwiO1xuLy9pbXBvcnQgeyBJbWFnZSB9IGZyb20gXCJ1aS9pbWFnZVwiO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tIFwiaW1hZ2Utc291cmNlXCI7XG5pbXBvcnQgeyBXZW50dXJlUG9pbnQgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3dlbnR1cmVwb2ludC93ZW50dXJlcG9pbnRcIjtcbmltcG9ydCB7IFdlbnR1cmVQb2ludFNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3dlbnR1cmVwb2ludC93ZW50dXJlcG9pbnQuc2VydmljZVwiO1xuaW1wb3J0IHsgVG5zU2lkZURyYXdlciB9IGZyb20gJ25hdGl2ZXNjcmlwdC1zaWRlZHJhd2VyJztcbmltcG9ydCB7IFRuc1NpZGVEcmF3ZXJPcHRpb25zTGlzdGVuZXIgfSBmcm9tICduYXRpdmVzY3JpcHQtc2lkZWRyYXdlcic7XG5pbXBvcnQgeyBQcml6ZVZpZXdDb21wb25lbnQgfSBmcm9tIFwiLi9wcml6ZS12aWV3XCI7XG5cbnZhciBtYXBzTW9kdWxlID0gcmVxdWlyZShcIm5hdGl2ZXNjcmlwdC1nb29nbGUtbWFwcy1zZGtcIik7XG52YXIgZGlhbG9nc01vZHVsZSA9IHJlcXVpcmUoXCJ1aS9kaWFsb2dzXCIpO1xudmFyIEltYWdlID0gcmVxdWlyZShcInVpL2ltYWdlXCIpLkltYWdlO1xudmFyIGltYWdlU291cmNlID0gcmVxdWlyZShcImltYWdlLXNvdXJjZVwiKTtcblxudmFyIHdhdGNoSWQ6IGFueTtcbnZhciBjdXJyZW50UG9zaXRpb246IExvY2F0aW9uO1xudmFyIGN1cnJlbnRQb3NDaXJjbGU6IGFueTtcbnZhciBjb2xsZWN0RGlzdGFuY2U6IG51bWJlcjsgLy9kaXN0YW5jZSBpbiBtIG9uIGhvdyBjbG9zZSB0byBlbmFibGUgY29sbGVjdC1wcm9wZXJ0eVxudmFyIG1hcFZpZXc6IGFueTtcbnZhciBjb2xsZWN0ZWRNYXJrZXJzID0gW107XG52YXIgc2VsZWN0ZWRNYXJrZXI7XG5cbnJlZ2lzdGVyRWxlbWVudChcIk1hcFZpZXdcIiwgKCkgPT4gcmVxdWlyZShcIm5hdGl2ZXNjcmlwdC1nb29nbGUtbWFwcy1zZGtcIikuTWFwVmlldyk7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogXCJtYXAtcGFnZVwiLFxuICBwcm92aWRlcnM6IFtXZW50dXJlUG9pbnRTZXJ2aWNlLCBNb2RhbERpYWxvZ1NlcnZpY2VdLFxuICB0ZW1wbGF0ZVVybDogXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS5odG1sXCIsXG4gIHN0eWxlVXJsczogW1wicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UtY29tbW9uLmNzc1wiLCBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmNzc1wiXVxufSlcblxuXG5leHBvcnQgY2xhc3MgTWFwUGFnZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBWaWV3Q2hpbGQoXCJNYXBWaWV3XCIpIG1hcFZpZXc6IEVsZW1lbnRSZWY7XG4gIEBWaWV3Q2hpbGQoXCJjb2xsZWN0QnV0dG9uXCIpIGNvbGxlY3RCdXR0b246IEVsZW1lbnRSZWY7XG5cbiAgbGF0aXR1ZGU6IG51bWJlcjtcbiAgbG9uZ2l0dWRlOiBudW1iZXI7XG4gIGFsdGl0dWRlOiBudW1iZXI7XG4gIHdlbnR1cmVQb2ludFRpdGxlOiBzdHJpbmc7XG4gIHdlbnR1cmVQb2ludEluZm86IHN0cmluZztcbiAgbWFya2VySXNTZWxlY3RlZDogYm9vbGVhbjtcbiAgaXNDbG9zZUVub3VnaFRvQ29sbGVjdDogYm9vbGVhbjtcbiAgLy9pIHN0b3JlcyB0aGUgaW5kZXggdmFsdWUgb2YgbWVudVxuICBwcml2YXRlIF9pOiBudW1iZXIgPSAwO1xuXHRnZXQgaSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9pO1xuXHR9XG4gIC8vaSBzYWFkYWFuIG1lbnVuIHNpc8Okw6RucmFrZW5uZXR1c3RhIGt1dW50ZWxpamFzdGFcblx0c2V0IGkoaTogbnVtYmVyKSB7XG5cdFx0dGhpcy5faSA9IGk7XG4gICAgdGhpcy5tZW51TGlzdGVuZXIoaSk7XG5cbiAgfVxuLy8gdMOkaMOkbiBtZW51biB0b2ltaW5uYWxsaXN1dXNcbiAgbWVudUxpc3RlbmVyKGkpIHtcbiAgICBjb25zb2xlLmxvZyhpKTtcbiAgICBpZihpID09IDEpIHtcbiAgICAgIGFsZXJ0KFwiUm91dGVzIGFyZSB5ZXQgdG8gY29tZVwiKTtcbiAgICB9O1xuXG4gICAgaWYoaSA9PSA0KSB7XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFtcIi9cIl0pO1xuICAgIH07XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJvdXRlcjogUm91dGVyLCBwcml2YXRlIGZvbnRpY29uOiBUTlNGb250SWNvblNlcnZpY2UsIHByaXZhdGUgd2VudHVyZVBvaW50U2VydmljZTogV2VudHVyZVBvaW50U2VydmljZSwgcHJpdmF0ZSBwYWdlOiBQYWdlLCBwcml2YXRlIF9tb2RhbFNlcnZpY2U6IE1vZGFsRGlhbG9nU2VydmljZSwgcHJpdmF0ZSB2Y1JlZjogVmlld0NvbnRhaW5lclJlZikge1xuICAgIHRoaXMud2VudHVyZVBvaW50U2VydmljZS5wb3B1bGF0ZSgpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gVE9ETzogTG9hZGVyP1xuICAgIC8vIFRPRE86IG1lbnVpdGVtIGljb25pdCBwdXV0dHV1LCBhY3Rpb25iYXJpbiBtYWhkIHBpaWxvdHRhbWluZW4oPylcbiAgICBUbnNTaWRlRHJhd2VyLmJ1aWxkKHtcbiAgICAgIHRlbXBsYXRlczogW3tcbiAgICAgICAgICB0aXRsZTogJ1dlbnR1cmVwb2ludHMnLFxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19ob21lX3doaXRlXzI0ZHAnLFxuICAgICAgICAgIC8vaW9zSWNvbjogJ2ljX2hvbWVfd2hpdGUnLFxuICAgICAgfSwge1xuICAgICAgICAgIHRpdGxlOiAnUm91dGVzJyxcbiAgICAgICAgICAvL2FuZHJvaWRJY29uOiAnaWNfZ2F2ZWxfd2hpdGVfMjRkcCcsXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfZ2F2ZWxfd2hpdGUnLFxuICAgICAgfSwge1xuICAgICAgICAgIHRpdGxlOiAnTXkgV2VudHVyZXMnLFxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19hY2NvdW50X2JhbGFuY2Vfd2hpdGVfMjRkcCcsXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfYWNjb3VudF9iYWxhbmNlX3doaXRlJyxcbiAgICAgIH0sIHtcbiAgICAgICAgICB0aXRsZTogJ1NldHRpbmdzJyxcbiAgICAgICAgLy8gIGFuZHJvaWRJY29uOiAnaWNfYnVpbGRfd2hpdGVfMjRkcCcsXG4gICAgICAgIC8vICBpb3NJY29uOiAnaWNfYnVpbGRfd2hpdGUnLFxuICAgICAgfSwge1xuICAgICAgICAgIHRpdGxlOiAnTG9nIG91dCcsXG4gICAgICAgIC8vICBhbmRyb2lkSWNvbjogJ2ljX2FjY291bnRfY2lyY2xlX3doaXRlXzI0ZHAnLFxuICAgICAgICAvLyAgaW9zSWNvbjogJ2ljX2FjY291bnRfY2lyY2xlX3doaXRlJyxcbiAgICAgIH1dLFxuICAgICAgdGl0bGU6ICdXZW50dXJlJyxcbiAgICAgIHN1YnRpdGxlOiAneW91ciB1cmJhbiBhZHZlbnR1cmUhJyxcbiAgICAgIGxpc3RlbmVyOiAoaW5kZXgpID0+IHtcbiAgICAgICAgICB0aGlzLmkgPSBpbmRleFxuICAgICAgfSxcbiAgICAgIGNvbnRleHQ6IHRoaXMsXG4gICAgfSk7XG4gIH1cblxuICBUbnNTaWRlRHJhd2VyT3B0aW9uc0xpc3RlbmVyID0gKGluZGV4KSA9PiB7XG4gICAgY29uc29sZS5sb2coaW5kZXgpXG4gIH07XG5cbiAgdG9nZ2xlU2lkZURyYXdlcigpIHtcbiAgICBUbnNTaWRlRHJhd2VyLnRvZ2dsZSgpO1xuICB9XG5cblxuICBjcmVhdGVNb2RlbFZpZXcobWFyaykge1xuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICBsZXQgb3B0aW9uczogTW9kYWxEaWFsb2dPcHRpb25zID0ge1xuICAgICAgICB2aWV3Q29udGFpbmVyUmVmOiB0aGlzLnZjUmVmLFxuICAgICAgICBjb250ZXh0OiBtYXJrLFxuICAgICAgICBmdWxsc2NyZWVuOiB0cnVlXG4gICAgfTtcbiAgICAvLyA+PiByZXR1cm5pbmctcmVzdWx0XG4gICAgdGhpcy5fbW9kYWxTZXJ2aWNlLnNob3dNb2RhbChQcml6ZVZpZXdDb21wb25lbnQsIG9wdGlvbnMpXG4gICAgICAgIC50aGVuKCgvKiAqLykgPT4ge1xuICAgICAgICAgICAgdGhpcy5tYXJrZXJJc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIC8vIDw8IHJldHVybmluZy1yZXN1bHRcbiAgfVxuXG4gIGNvbGxlY3RCdXR0b25UYXBwZWQoKSB7XG4gICAgLy8gVE9ETzogVMOkaMOkbiBzZSBrZXLDpHlzdG9pbWludG8sIGlmIGRpc3RhbmNlIGp0biwgbmlpbiB0dW9sdGEgdG9pIGNvbGxlY3QoKVxuICAgIC8vIFRoaXMgbWlnaHQgYmUgc3R1cGlkLCBidXQgd29ya3MgZm9yIG5vdyA6KVxuICAgIC8vVE9ETzogYWRkaW5nIGNvbGxlY3RlZCBtYXJrZXIgdG8gYSBsaXN0IGV0Yy4gYjQgcmVtb3ZpbmdcblxuICAgICAgY29sbGVjdERpc3RhbmNlID0gNTA7XG4gICAgICBpZihnZXREaXN0YW5jZVRvKHNlbGVjdGVkTWFya2VyKSA8IGNvbGxlY3REaXN0YW5jZSkge1xuICAgICAgICBsZXQgYW1vdW50ID0gaG93TWFueUNvbGxlY3RlZCgpO1xuICAgICAgICB0aGlzLmNvbGxlY3QoYW1vdW50LCBzZWxlY3RlZE1hcmtlcik7XG4gICAgICAgIC8vYWxlcnQoXCJWZW50dXJlIHBvaW50IGNvbGxlY3RlZC4gXFxuQ29sbGVjdGVkOiBcIiArIGFtb3VudCk7XG4gICAgICAgIGNvbGxlY3RlZE1hcmtlcnMucHVzaChzZWxlY3RlZE1hcmtlcik7XG4gICAgICAgIG1hcFZpZXcucmVtb3ZlTWFya2VyKHNlbGVjdGVkTWFya2VyKTtcbiAgICAgICAgLy9cbiAgICAgICAgY29uc29sZS5sb2coXCJZb3UgaGF2ZSBcIiArIGNvbGxlY3RlZE1hcmtlcnMubGVuZ3RoICsgXCIgY29sbGVjdGVkIG1hcmtlcnMuXCIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlxcbk1hcmtlciB0b28gZmFyIGF3YXksIG1vdmUgY2xvc2VyLlwiKTtcbiAgICAgIH1cblxuICB9XG5cbiAgY29sbGVjdChhbW91bnQsIG1hcmspIHtcbiAgICB0aGlzLmNyZWF0ZU1vZGVsVmlldyhtYXJrKTtcbiAgfVxuXG4gIGFkZFdlbnR1cmVQb2ludHMobWFwVmlldykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgd1BvaW50ID0gdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSk7XG4gICAgICB2YXIgbWFya2VyID0gbmV3IG1hcHNNb2R1bGUuTWFya2VyKCk7XG5cbiAgICAgIG1hcmtlci5wb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKHdQb2ludC5sYXQsIHdQb2ludC5sbmcpO1xuICAgICAgbWFya2VyLnRpdGxlID0gd1BvaW50LnRpdGxlO1xuICAgICAgbWFya2VyLnNuaXBwZXQgPSBcIlwiO1xuICAgICAgLy9BbmRyb2lkaWxsYSB0b2ltaWkuIElvc2lsbGUgcGl0w6TDpCBrYXRzb2EgbWl0ZW4gcmVzb3VyY2UgdG9pbWlpLiBQQzpsbMOkIGVpIHB5c3R5dMOkIHRlc3RhYW1hYW5cbiAgICAgIC8vSWtvbmlhIGpvdXR1dSBoaWVtbmEgbXVva2thYW1hYW4ocGllbmVtbcOka3NpIGphIGxpc8OkdMOkw6RuIHBpZW5pIG9zb2l0aW4gYWxhbGFpdGFhbilcbiAgICAgIHZhciBpY29uID0gbmV3IEltYWdlKCk7XG4gICAgICBpY29uLmltYWdlU291cmNlID0gaW1hZ2VTb3VyY2UuZnJvbVJlc291cmNlKCdpY29uJyk7XG4gICAgICBtYXJrZXIuaWNvbiA9IGljb247XG4gICAgICBtYXJrZXIuZHJhZ2dhYmxlID0gdHJ1ZTtcbiAgICAgIG1hcmtlci51c2VyRGF0YSA9IHtpbmRleDogMX07XG4gICAgICBtYXBWaWV3LmFkZE1hcmtlcihtYXJrZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8vTWFwIGV2ZW50c1xuICBvbk1hcFJlYWR5ID0gKGV2ZW50KSA9PiB7XG4gICAgc3RhcnRXYXRjaChldmVudCk7XG5cbiAgICAvLyBDaGVjayBpZiBsb2NhdGlvbiBzZXJ2aWNlcyBhcmUgZW5hYmxlZFxuICAgIGlmICghZ2VvbG9jYXRpb24uaXNFbmFibGVkKCkpIHtcbiAgICAgICAgZ2VvbG9jYXRpb24uZW5hYmxlTG9jYXRpb25SZXF1ZXN0KCk7XG4gICAgfSBlbHNlIGNvbnNvbGUubG9nKFwiTG9jYXRpb24gc2VydmljZXMgZW5hYmxlZC5cIik7XG5cbiAgICBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xuICAgIHZhciBnTWFwID0gbWFwVmlldy5nTWFwO1xuXG4gICAgdGhpcy5hZGRXZW50dXJlUG9pbnRzKG1hcFZpZXcpO1xuXG4gIH07XG5cbiAgb25Db29yZGluYXRlVGFwcGVkID0gKGV2ZW50KSA9PiB7XG4gICAgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgICB0aGlzLndlbnR1cmVQb2ludFRpdGxlID0gXCJcIjtcbiAgICB0aGlzLndlbnR1cmVQb2ludEluZm8gPSBcIlwiO1xuICAgIHRoaXMubWFya2VySXNTZWxlY3RlZCA9IGZhbHNlO1xuICB9O1xuXG4gIG9uQ29vcmRpbmF0ZUxvbmdQcmVzcyA9IChldmVudCkgPT4ge1xuICAgIHZhciBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xuICAgIHZhciBsYXQgPSBldmVudC5wb3NpdGlvbi5sYXRpdHVkZTtcbiAgICB2YXIgbG5nID0gZXZlbnQucG9zaXRpb24ubG9uZ2l0dWRlO1xuICB9O1xuXG4gIG9uTWFya2VyU2VsZWN0ID0gKGV2ZW50KSA9PiB7XG5cbiAgICBpbnRlcmZhY2UgUG9zaXRpb25PYmplY3Qge1xuICAgICAgXCJsYXRpdHVkZVwiOiBzdHJpbmcsXG4gICAgICBcImxvbmdpdHVkZVwiOiBzdHJpbmdcbiAgICB9XG5cbiAgICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcblxuICAgIGxldCBtYXJrZXJQb3MgPSBKU09OLnN0cmluZ2lmeShldmVudC5tYXJrZXIucG9zaXRpb24pO1xuICAgIGxldCBjdXJyZW50UG9zID0gSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKTtcbiAgICBsZXQgZGlzdGFuY2UgPSBnZXREaXN0YW5jZVRvKGV2ZW50Lm1hcmtlcik7XG5cbiAgICAvLyBNYWtlIGJvdHRvbSBiYXIgdmlzaWJsZVxuICAgIHRoaXMubWFya2VySXNTZWxlY3RlZCA9IHRydWU7XG5cbiAgICAvLyBDaGFuZ2UgdGhlIGNvbnRlbnQgb2YgdGhlIGJvdHRvbSBiYXIgdGV4dFxuICAgIHRoaXMud2VudHVyZVBvaW50VGl0bGUgPSBldmVudC5tYXJrZXIudGl0bGU7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VudHVyZVBvaW50U2VydmljZS5nZXRQb2ludHMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGV2ZW50Lm1hcmtlci50aXRsZSA9PT0gdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSkudGl0bGUpIHtcbiAgICAgICAgdGhpcy53ZW50dXJlUG9pbnRJbmZvID0gdGhpcy53ZW50dXJlUG9pbnRTZXJ2aWNlLmdldFBvaW50cygpLmdldEl0ZW0oaSkuaW5mbztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBldmVudC5tYXJrZXIuc25pcHBldCA9IFwiRGlzdGFuY2U6IFwiICsgZGlzdGFuY2UudG9GaXhlZCgwKSArIFwiIG1cIjtcbiAgICBpZiAoZGlzdGFuY2UgPCA1MCkge1xuICAgICAgdGhpcy5pc0Nsb3NlRW5vdWdoVG9Db2xsZWN0ID0gdHJ1ZTtcbiAgICB9IGVsc2UgdGhpcy5pc0Nsb3NlRW5vdWdoVG9Db2xsZWN0ID0gZmFsc2U7XG5cbiAgICBzZWxlY3RlZE1hcmtlciA9IGV2ZW50Lm1hcmtlcjtcblxuICB9O1xuXG4gIG9uTWFya2VyQmVnaW5EcmFnZ2luZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyQmVnaW5EcmFnZ2luZ1wiKTtcbiAgfTtcblxuICBvbk1hcmtlckVuZERyYWdnaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJFbmREcmFnZ2luZ1wiKTtcbiAgfTtcblxuICBvbk1hcmtlckRyYWcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckRyYWdcIik7XG4gIH07XG5cbiAgb25DYW1lcmFDaGFuZ2VkID0gKGV2ZW50KSA9PiB7XG4gICAgLy9cbiAgfTtcblxuICBvblNoYXBlU2VsZWN0ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJTaGFwZSBzZWxlY3RlZC5cIik7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydFdhdGNoKGV2ZW50KSB7XG5cbiAgaW50ZXJmYWNlIExvY2F0aW9uT2JqZWN0IHtcbiAgICBcImxhdGl0dWRlXCI6IG51bWJlcixcbiAgICBcImxvbmdpdHVkZVwiOiBudW1iZXIsXG4gICAgXCJhbHRpdHVkZVwiOiBudW1iZXIsXG4gICAgXCJob3Jpem9udGFsQWNjdXJhY3lcIjogbnVtYmVyLFxuICAgIFwidmVydGljYWxBY2N1cmFjeVwiOiBudW1iZXIsXG4gICAgXCJzcGVlZFwiOiBudW1iZXIsXG4gICAgXCJkaXJlY3Rpb25cIjogbnVtYmVyLFxuICAgIFwidGltZXN0YW1wXCI6c3RyaW5nXG4gIH1cblxuICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgY3VycmVudFBvc0NpcmNsZSA9IG5ldyBtYXBzTW9kdWxlLkNpcmNsZSgpO1xuICBjdXJyZW50UG9zQ2lyY2xlLmNlbnRlciA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKDAsIDApO1xuICBjdXJyZW50UG9zQ2lyY2xlLnZpc2libGUgPSB0cnVlO1xuICBjdXJyZW50UG9zQ2lyY2xlLnJhZGl1cyA9IDIwO1xuICBjdXJyZW50UG9zQ2lyY2xlLmZpbGxDb2xvciA9IG5ldyBDb2xvcignIzZjOWRmMCcpO1xuICBjdXJyZW50UG9zQ2lyY2xlLnN0cm9rZUNvbG9yID0gbmV3IENvbG9yKCcjMzk2YWJkJyk7XG4gIGN1cnJlbnRQb3NDaXJjbGUuc3Ryb2tld2lkdGggPSAyO1xuICBjdXJyZW50UG9zQ2lyY2xlLmNsaWNrYWJsZSA9IHRydWU7XG4gIG1hcFZpZXcuYWRkQ2lyY2xlKGN1cnJlbnRQb3NDaXJjbGUpO1xuXG4gIHdhdGNoSWQgPSBnZW9sb2NhdGlvbi53YXRjaExvY2F0aW9uKFxuICBmdW5jdGlvbiAobG9jKSB7XG4gICAgICBpZiAobG9jKSB7XG4gICAgICAgICAgbGV0IG9iajogTG9jYXRpb25PYmplY3QgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGxvYykpO1xuICAgICAgICAgIHRoaXMubGF0aXR1ZGUgPSBvYmoubGF0aXR1ZGU7XG4gICAgICAgICAgdGhpcy5sb25naXR1ZGUgPSBvYmoubG9uZ2l0dWRlO1xuICAgICAgICAgIHRoaXMuYWx0aXR1ZGUgPSBvYmouYWx0aXR1ZGU7XG4gICAgICAgICAgY3VycmVudFBvc2l0aW9uID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcob2JqLmxhdGl0dWRlLCBvYmoubG9uZ2l0dWRlKTtcblxuICAgICAgICAgIGN1cnJlbnRQb3NDaXJjbGUuY2VudGVyID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcodGhpcy5sYXRpdHVkZSwgdGhpcy5sb25naXR1ZGUpO1xuXG4gICAgICAgICAgbWFwVmlldy5sYXRpdHVkZSA9IHRoaXMubGF0aXR1ZGU7XG4gICAgICAgICAgbWFwVmlldy5sb25naXR1ZGUgPSB0aGlzLmxvbmdpdHVkZTtcbiAgICAgIH1cbiAgfSxcbiAgZnVuY3Rpb24oZSl7XG4gICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIGUubWVzc2FnZSk7XG4gIH0sXG4gIHtkZXNpcmVkQWNjdXJhY3k6IDMsIHVwZGF0ZURpc3RhbmNlOiAxMCwgbWluaW11bVVwZGF0ZVRpbWUgOiAxMDAwICogMn0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kV2F0Y2goKSB7XG4gICAgaWYgKHdhdGNoSWQpIHtcbiAgICAgICAgZ2VvbG9jYXRpb24uY2xlYXJXYXRjaCh3YXRjaElkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJNeSB3YXRjaCBpcyBlbmRlZC4uLiBULiBKb24gU25vd1wiKTtcbiAgICB9XG59XG5cbi8vIFRPRE86IHRvaW1pbWFhbiBhbmRyb2lkaWxsZSBrYW5zc2FcbmZ1bmN0aW9uIGdldERpc3RhbmNlVG8ob2JqKSB7XG4gIGxldCBvYmpQb3MgPSBKU09OLnN0cmluZ2lmeShvYmoucG9zaXRpb24pO1xuICBsZXQgY3VycmVudFBvcyA9IEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbik7XG4gIGxldCBkaXN0YW5jZSA9IG51bGw7XG5cbiAgaWYoaXNJT1MpIHtcbiAgICAvL2NvbnNvbGUubG9nKFwiUnVubmluZyBvbiBpb3MuXCIpXG4gICAgZGlzdGFuY2UgPSBnZW9sb2NhdGlvbi5kaXN0YW5jZShKU09OLnBhcnNlKG9ialBvcykuX2lvcywgSlNPTi5wYXJzZShjdXJyZW50UG9zKS5faW9zKTtcbiAgfSBlbHNlIGlmKGlzQW5kcm9pZCkge1xuICAgIGNvbnNvbGUubG9nKFwiUnVubmluZyBvbiBhbmRyb2lkLlwiKTtcbiAgICBkaXN0YW5jZSA9IDM7Ly9nZW9sb2NhdGlvbi5kaXN0YW5jZShKU09OLnBhcnNlKG9ialBvcykuX2FuZHJvaWQsIEpTT04ucGFyc2UoY3VycmVudFBvcykuX2FuZHJvaWQpO1xuICB9IGVsc2Uge1xuICAgIGRpc3RhbmNlID0gXCJlcnJvclwiO1xuICAgIGNvbnNvbGUubG9nKFwiQ291bGQgbm90IGZpbmQgZGlzdGFuY2UuXCIpO1xuICB9XG4gICAgcmV0dXJuIGRpc3RhbmNlO1xufVxuXG5cbmZ1bmN0aW9uIGhvd01hbnlDb2xsZWN0ZWQoKSB7XG4gIHJldHVybiBjb2xsZWN0ZWRNYXJrZXJzLmxlbmd0aCArIDE7XG59XG5cbi8vaGFuZGxlcyB0aGUgY29sbGVjdGlvbiBhbmQgcmV0dXJucyBtZXNzYWdlXG5mdW5jdGlvbiBjb2xsZWN0KGFtb3VudCwgbWFyaykge1xuICBkaWFsb2dzTW9kdWxlLmFsZXJ0KHtcbiAgICBtZXNzYWdlOiBcIldlbnR1cmUgcG9pbnQgXCIgKyBtYXJrLnRpdGxlICsgXCIgY29sbGVjdGVkISBcXG5Zb3UgaGF2ZTogXCIgKyBhbW91bnQsXG4gICAgb2tCdXR0b25UZXh0OiBcIk9LXCJcbiAgfSk7XG59XG4iXX0=