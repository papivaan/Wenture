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
//var _currentPosition: any;
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
        this.TnsSideDrawerOptionsListener = function (index) {
            console.log(index);
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
        // TODO: menuitem iconit puuttuu
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
    MapPageComponent.prototype.bottomButtonTapped = function () {
        console.log("Mänit sitte painaa nappulaa :O");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLXBhZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFwLXBhZ2UuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBeUU7QUFDekUscUNBQTRDO0FBQzVDLDBFQUFzRTtBQUN0RSxzREFBd0Q7QUFDeEQsMENBQXlDO0FBQ3pDLGdDQUErQjtBQUMvQiwrQkFBOEI7QUFJOUIsdUZBQXFGO0FBQ3JGLG1FQUF3RDtBQUV4RCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUN6RCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDMUMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN0QyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFMUMsSUFBSSxPQUFZLENBQUM7QUFDakIsSUFBSSxlQUF5QixDQUFDO0FBQzlCLElBQUksZ0JBQXFCLENBQUM7QUFDMUIsSUFBSSxlQUF1QixDQUFDLENBQUMsdURBQXVEO0FBQ3BGLElBQUksT0FBWSxDQUFDO0FBQ2pCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzFCLDRCQUE0QjtBQUU1QixrQ0FBZSxDQUFDLFNBQVMsRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsT0FBTyxFQUEvQyxDQUErQyxDQUFDLENBQUM7QUFVbEYsSUFBYSxnQkFBZ0I7SUFVM0IsMEJBQW9CLE1BQWMsRUFBVSxtQkFBd0MsRUFBVSxJQUFVO1FBQXhHLGlCQUVDO1FBRm1CLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQVUsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUh4RyxrQ0FBa0M7UUFDbEMsTUFBQyxHQUFXLENBQUMsQ0FBQztRQWlEZCxZQUFZO1FBQ1osZUFB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QUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2pELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztJQUVwQixFQUFFLENBQUEsQ0FBQyxnQkFBSyxDQUFDLENBQUMsQ0FBQztRQUNULGdDQUFnQztRQUNoQyxRQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFBLENBQUMsb0JBQVMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ25DLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQSxxRkFBcUY7SUFDcEcsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUNDLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDcEIsQ0FBQztBQUVEO0lBQ0UsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDckMsQ0FBQztBQUVELDRDQUE0QztBQUM1QyxpQkFBaUIsTUFBTTtJQUNyQixhQUFhLENBQUMsS0FBSyxDQUFDO1FBQ2xCLE9BQU8sRUFBRSx1Q0FBdUMsR0FBRyxNQUFNO1FBQ3pELFlBQVksRUFBRSxJQUFJO0tBQ25CLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIE9uSW5pdCwgVmlld0NoaWxkIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGlzQW5kcm9pZCwgaXNJT1MgfSBmcm9tIFwicGxhdGZvcm1cIjtcbmltcG9ydCB7cmVnaXN0ZXJFbGVtZW50fSBmcm9tIFwibmF0aXZlc2NyaXB0LWFuZ3VsYXIvZWxlbWVudC1yZWdpc3RyeVwiO1xuaW1wb3J0ICogYXMgZ2VvbG9jYXRpb24gZnJvbSBcIm5hdGl2ZXNjcmlwdC1nZW9sb2NhdGlvblwiO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gXCJ1aS9wYWdlXCI7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCJjb2xvclwiO1xuLy9pbXBvcnQgeyBJbWFnZSB9IGZyb20gXCJ1aS9pbWFnZVwiO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tIFwiaW1hZ2Utc291cmNlXCI7XG5pbXBvcnQgeyBXZW50dXJlUG9pbnQgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3dlbnR1cmVwb2ludC93ZW50dXJlcG9pbnRcIjtcbmltcG9ydCB7IFdlbnR1cmVQb2ludFNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3dlbnR1cmVwb2ludC93ZW50dXJlcG9pbnQuc2VydmljZVwiO1xuaW1wb3J0IHsgVG5zU2lkZURyYXdlciB9IGZyb20gJ25hdGl2ZXNjcmlwdC1zaWRlZHJhd2VyJztcblxudmFyIG1hcHNNb2R1bGUgPSByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKTtcbnZhciBkaWFsb2dzTW9kdWxlID0gcmVxdWlyZShcInVpL2RpYWxvZ3NcIik7XG52YXIgSW1hZ2UgPSByZXF1aXJlKFwidWkvaW1hZ2VcIikuSW1hZ2U7XG52YXIgaW1hZ2VTb3VyY2UgPSByZXF1aXJlKFwiaW1hZ2Utc291cmNlXCIpO1xuXG52YXIgd2F0Y2hJZDogYW55O1xudmFyIGN1cnJlbnRQb3NpdGlvbjogTG9jYXRpb247XG52YXIgY3VycmVudFBvc0NpcmNsZTogYW55O1xudmFyIGNvbGxlY3REaXN0YW5jZTogbnVtYmVyOyAvL2Rpc3RhbmNlIGluIG0gb24gaG93IGNsb3NlIHRvIGVuYWJsZSBjb2xsZWN0LXByb3BlcnR5XG52YXIgbWFwVmlldzogYW55O1xudmFyIGNvbGxlY3RlZE1hcmtlcnMgPSBbXTtcbi8vdmFyIF9jdXJyZW50UG9zaXRpb246IGFueTtcblxucmVnaXN0ZXJFbGVtZW50KFwiTWFwVmlld1wiLCAoKSA9PiByZXF1aXJlKFwibmF0aXZlc2NyaXB0LWdvb2dsZS1tYXBzLXNka1wiKS5NYXBWaWV3KTtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm1hcC1wYWdlXCIsXG4gIHByb3ZpZGVyczogW1dlbnR1cmVQb2ludFNlcnZpY2VdLFxuICB0ZW1wbGF0ZVVybDogXCJwYWdlcy9tYXAtcGFnZS9tYXAtcGFnZS5odG1sXCIsXG4gIHN0eWxlVXJsczogW1wicGFnZXMvbWFwLXBhZ2UvbWFwLXBhZ2UtY29tbW9uLmNzc1wiLCBcInBhZ2VzL21hcC1wYWdlL21hcC1wYWdlLmNzc1wiXVxufSlcblxuXG5leHBvcnQgY2xhc3MgTWFwUGFnZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBWaWV3Q2hpbGQoXCJNYXBWaWV3XCIpIG1hcFZpZXc6IEVsZW1lbnRSZWY7XG5cbiAgbGF0aXR1ZGU6IG51bWJlcjtcbiAgbG9uZ2l0dWRlOiBudW1iZXI7XG4gIGFsdGl0dWRlOiBudW1iZXI7XG4gIF9jdXJyZW50UG9zaXRpb246IGFueTtcbiAgLy9pIHN0b3JlcyB0aGUgaW5kZXggdmFsdWUgb2YgbWVudVxuICBpOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsIHByaXZhdGUgd2VudHVyZVBvaW50U2VydmljZTogV2VudHVyZVBvaW50U2VydmljZSwgcHJpdmF0ZSBwYWdlOiBQYWdlKSB7XG5cbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIFRPRE86IExvYWRlcj9cbiAgICAvLyBUT0RPOiBtZW51aXRlbSBpY29uaXQgcHV1dHR1dVxuICAgIFRuc1NpZGVEcmF3ZXIuYnVpbGQoe1xuICAgICAgdGVtcGxhdGVzOiBbe1xuICAgICAgICAgIHRpdGxlOiAnV2VudHVyZXBvaW50cycsXG4gICAgICAgICAgLy9hbmRyb2lkSWNvbjogJ2ljX2hvbWVfd2hpdGVfMjRkcCcsXG4gICAgICAgICAgLy9pb3NJY29uOiAnaWNfaG9tZV93aGl0ZScsXG4gICAgICB9LCB7XG4gICAgICAgICAgdGl0bGU6ICdSb3V0ZXMnLFxuICAgICAgICAgIC8vYW5kcm9pZEljb246ICdpY19nYXZlbF93aGl0ZV8yNGRwJyxcbiAgICAgICAgICAvL2lvc0ljb246ICdpY19nYXZlbF93aGl0ZScsXG4gICAgICB9LCB7XG4gICAgICAgICAgdGl0bGU6ICdNeSBXZW50dXJlcycsXG4gICAgICAgICAgLy9hbmRyb2lkSWNvbjogJ2ljX2FjY291bnRfYmFsYW5jZV93aGl0ZV8yNGRwJyxcbiAgICAgICAgICAvL2lvc0ljb246ICdpY19hY2NvdW50X2JhbGFuY2Vfd2hpdGUnLFxuICAgICAgfSwge1xuICAgICAgICAgIHRpdGxlOiAnU2V0dGluZ3MnLFxuICAgICAgICAvLyAgYW5kcm9pZEljb246ICdpY19idWlsZF93aGl0ZV8yNGRwJyxcbiAgICAgICAgLy8gIGlvc0ljb246ICdpY19idWlsZF93aGl0ZScsXG4gICAgICB9LCB7XG4gICAgICAgICAgdGl0bGU6ICdMb2cgb3V0JyxcbiAgICAgICAgLy8gIGFuZHJvaWRJY29uOiAnaWNfYWNjb3VudF9jaXJjbGVfd2hpdGVfMjRkcCcsXG4gICAgICAgIC8vICBpb3NJY29uOiAnaWNfYWNjb3VudF9jaXJjbGVfd2hpdGUnLFxuICAgICAgfV0sXG4gICAgICB0aXRsZTogJ1dlbnR1cmUnLFxuICAgICAgc3VidGl0bGU6ICd5b3VyIHVyYmFuIGFkdmVudHVyZSEnLFxuICAgICAgbGlzdGVuZXI6IChpbmRleCkgPT4ge1xuICAgICAgICAgIHRoaXMuaSA9IGluZGV4XG4gICAgICB9LFxuICAgICAgY29udGV4dDogdGhpcyxcbiAgICB9KTtcblxuICB9XG5cbiAgdG9nZ2xlU2lkZURyYXdlcigpIHtcbiAgICBUbnNTaWRlRHJhd2VyLnRvZ2dsZSgpO1xuICB9XG5cbiAgYm90dG9tQnV0dG9uVGFwcGVkKCkge1xuICAgIGNvbnNvbGUubG9nKFwiTcOkbml0IHNpdHRlIHBhaW5hYSBuYXBwdWxhYSA6T1wiKTtcbiAgfVxuXG4gIC8vTWFwIGV2ZW50c1xuICBvbk1hcFJlYWR5ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXAgUmVhZHlcIik7XG4gICAgc3RhcnRXYXRjaChldmVudCk7XG5cbiAgICAvLyBDaGVjayBpZiBsb2NhdGlvbiBzZXJ2aWNlcyBhcmUgZW5hYmxlZFxuICAgIGlmICghZ2VvbG9jYXRpb24uaXNFbmFibGVkKCkpIHtcbiAgICAgICAgZ2VvbG9jYXRpb24uZW5hYmxlTG9jYXRpb25SZXF1ZXN0KCk7XG4gICAgfSBlbHNlIGNvbnNvbGUubG9nKFwiQWxsZXMgaW4gT3JkbnVuZ1wiKTtcblxuICAgIHZhciBtYXBWaWV3ID0gZXZlbnQub2JqZWN0O1xuICAgIHZhciBnTWFwID0gbWFwVmlldy5nTWFwO1xuXG4gICAgdmFyIG1hcmtlciA9IG5ldyBtYXBzTW9kdWxlLk1hcmtlcigpO1xuICAgIG1hcmtlci5wb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKDYyLjIzMDg5MTIsIDI1LjczNDM4NTMpO1xuICAgIG1hcmtlci50aXRsZSA9IFwiTWF0dGlsYW5uaWVtaVwiO1xuICAgIG1hcmtlci5zbmlwcGV0ID0gXCJVbml2ZXJzaXR5IENhbXB1c1wiO1xuICAgIHZhciBpY29uID0gbmV3IEltYWdlKCk7XG4gICAgaWNvbi5pbWFnZVNvdXJjZSA9IGltYWdlU291cmNlLmZyb21SZXNvdXJjZSgnaWNvbicpO1xuICAgIG1hcmtlci5pY29uID0gaWNvbjtcbiAgICBtYXJrZXIudXNlckRhdGEgPSB7aW5kZXg6IDF9O1xuICAgIG1hcFZpZXcuYWRkTWFya2VyKG1hcmtlcik7XG5cblxuLypcbiAgICB2YXIgY2lyY2xlID0gbmV3IG1hcHNNb2R1bGUuQ2lyY2xlKCk7XG4gICAgY2lyY2xlLmNlbnRlciA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKDYyLjIzLCAyNS43Myk7XG4gICAgY2lyY2xlLnZpc2libGUgPSB0cnVlO1xuICAgIGNpcmNsZS5yYWRpdXMgPSA1MDtcbiAgICBjaXJjbGUuZmlsbENvbG9yID0gbmV3IENvbG9yKCcjOTlmZjg4MDAnKTtcbiAgICBjaXJjbGUuc3Ryb2tlQ29sb3IgPSBuZXcgQ29sb3IoJyM5OWZmMDAwMCcpO1xuICAgIGNpcmNsZS5zdHJva2VXaWR0aCA9IDI7XG4gICAgbWFwVmlldy5hZGRDaXJjbGUoY2lyY2xlKTtcbiovXG4gIH07XG5cblxuXG4gIG9uQ29vcmRpbmF0ZUxvbmdQcmVzcyA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTG9uZ1ByZXNzXCIpO1xuXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG4gICAgdmFyIGxhdCA9IGV2ZW50LnBvc2l0aW9uLmxhdGl0dWRlO1xuICAgIHZhciBsbmcgPSBldmVudC5wb3NpdGlvbi5sb25naXR1ZGU7XG5cbiAgICBjb25zb2xlLmxvZyhcIlRhcHBlZCBsb2NhdGlvbjogXFxuXFx0TGF0aXR1ZGU6IFwiICsgZXZlbnQucG9zaXRpb24ubGF0aXR1ZGUgK1xuICAgICAgICAgICAgICAgICAgICBcIlxcblxcdExvbmdpdHVkZTogXCIgKyBldmVudC5wb3NpdGlvbi5sb25naXR1ZGUpO1xuXG4gICAgdmFyIG1hcmtlciA9IG5ldyBtYXBzTW9kdWxlLk1hcmtlcigpO1xuICAgIG1hcmtlci5wb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKGxhdCwgbG5nKTtcbiAgICBtYXJrZXIudGl0bGUgPSBcIldlbnR1cmUgcG9pbnRcIjtcbiAgICBtYXJrZXIuc25pcHBldCA9IFwiXCI7XG4gICAgLy9BbmRyb2lkaWxsYSB0b2ltaWkuIElvc2lsbGUgcGl0w6TDpCBrYXRzb2EgbWl0ZW4gcmVzb3VyY2UgdG9pbWlpLiBQQzpsbMOkIGVpIHB5c3R5dMOkIHRlc3RhYW1hYW5cbiAgICAvL0lrb25pYSBqb3V0dXUgaGllbW5hIG11b2trYWFtYWFuKHBpZW5lbW3DpGtzaSBqYSBsaXPDpHTDpMOkbiBwaWVuaSBvc29pdGluIGFsYWxhaXRhYW4pXG4gICAgdmFyIGljb24gPSBuZXcgSW1hZ2UoKTtcbiAgICBpY29uLmltYWdlU291cmNlID0gaW1hZ2VTb3VyY2UuZnJvbVJlc291cmNlKCdpY29uJyk7XG4gICAgbWFya2VyLmljb24gPSBpY29uO1xuICAgIG1hcmtlci5kcmFnZ2FibGUgPSB0cnVlO1xuICAgIG1hcmtlci51c2VyRGF0YSA9IHtpbmRleDogMX07XG4gICAgbWFwVmlldy5hZGRNYXJrZXIobWFya2VyKTtcbiAgfTtcblxuICBUbnNTaWRlRHJhd2VyT3B0aW9uc0xpc3RlbmVyID0gKGluZGV4KSA9PiB7XG4gICAgY29uc29sZS5sb2coaW5kZXgpXG4gIH07XG5cbiAgb25NYXJrZXJTZWxlY3QgPSAoZXZlbnQpID0+IHtcblxuICAgIGludGVyZmFjZSBQb3NpdGlvbk9iamVjdCB7XG4gICAgICBcImxhdGl0dWRlXCI6IHN0cmluZyxcbiAgICAgIFwibG9uZ2l0dWRlXCI6IHN0cmluZ1xuICAgIH1cblxuXG4gICAgdmFyIG1hcFZpZXcgPSBldmVudC5vYmplY3Q7XG5cbiAgICBsZXQgbWFya2VyUG9zID0gSlNPTi5zdHJpbmdpZnkoZXZlbnQubWFya2VyLnBvc2l0aW9uKTtcbiAgICBsZXQgY3VycmVudFBvcyA9IEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbik7XG4gICAgbGV0IGRpc3RhbmNlID0gZ2V0RGlzdGFuY2VUbyhldmVudC5tYXJrZXIpO1xuXG4gICAgZXZlbnQubWFya2VyLnNuaXBwZXQgPSBcIkRpc3RhbmNlOiBcIiArIGRpc3RhbmNlLnRvRml4ZWQoMCkgKyBcIiBtXCI7XG5cbiAgICBjb25zb2xlLmxvZyhcIlxcblxcdE1hcmtlclNlbGVjdDogXCIgKyBldmVudC5tYXJrZXIudGl0bGVcbiAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRNYXJrZXIgcG9zaXRpb246IFwiICsgbWFya2VyUG9zXG4gICAgICAgICAgICAgICAgICArIFwiXFxuXFx0Q3VycmVudCBwb3NpdGlvbjogXCIgKyBjdXJyZW50UG9zXG4gICAgICAgICAgICAgICAgICArIFwiXFxuXFx0RGlzdGFuY2UgdG8gbWFya2VyOiBcIiArIGRpc3RhbmNlLnRvRml4ZWQoMikgKyBcIm1cIik7XG5cbiAgICAvLyBUaGlzIG1pZ2h0IGJlIHN0dXBpZCwgYnV0IHdvcmtzIGZvciBub3cgOilcbiAgICAvL1RPRE86IGFkZGluZyBjb2xsZWN0ZWQgbWFya2VyIHRvIGEgbGlzdCBldGMuIGI0IHJlbW92aW5nXG4gICAgZnVuY3Rpb24gY29sbGVjdE1hcmtlcihtYXJrKSB7XG4gICAgICBjb2xsZWN0RGlzdGFuY2UgPSA1MDtcbiAgICAgIGlmKGdldERpc3RhbmNlVG8obWFyaykgPCBjb2xsZWN0RGlzdGFuY2UpIHtcbiAgICAgICAgbGV0IGFtb3VudCA9IGhvd01hbnlDb2xsZWN0ZWQoKTtcbiAgICAgICAgY29sbGVjdChhbW91bnQpO1xuICAgICAgICAvL2FsZXJ0KFwiVmVudHVyZSBwb2ludCBjb2xsZWN0ZWQuIFxcbkNvbGxlY3RlZDogXCIgKyBhbW91bnQpO1xuICAgICAgICBjb2xsZWN0ZWRNYXJrZXJzLnB1c2gobWFyayk7XG4gICAgICAgIG1hcFZpZXcucmVtb3ZlTWFya2VyKG1hcmspO1xuICAgICAgICBjb25zb2xlLmxvZyhcIllvdSBoYXZlIFwiICsgY29sbGVjdGVkTWFya2Vycy5sZW5ndGggKyBcIiBjb2xsZWN0ZWQgbWFya2Vycy5cIilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiXFxuTWFya2VyIHRvbyBmYXIgYXdheSwgbW92ZSBjbG9zZXIuXCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbGxlY3RNYXJrZXIoZXZlbnQubWFya2VyKTtcblxuICB9O1xuXG4gIG9uTWFya2VyQmVnaW5EcmFnZ2luZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiTWFya2VyQmVnaW5EcmFnZ2luZ1wiKTtcbiAgfTtcblxuICBvbk1hcmtlckVuZERyYWdnaW5nID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJNYXJrZXJFbmREcmFnZ2luZ1wiKTtcbiAgfTtcblxuICBvbk1hcmtlckRyYWcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIk1hcmtlckRyYWdcIik7XG4gIH07XG5cbiAgb25DYW1lcmFDaGFuZ2VkID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJDYW1lcmFDaGFuZ2VcIik7XG4gICAgY29uc29sZS5sb2coXCJXZW50dXJlIFBvaW50czpcIik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiXFx0XCIgKyBKU09OLnN0cmluZ2lmeSh0aGlzLndlbnR1cmVQb2ludFNlcnZpY2UuZ2V0UG9pbnRzKCkuZ2V0SXRlbShpKSkpO1xuICAgIH1cbiAgfTtcblxuICBvblNoYXBlU2VsZWN0ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJZb3VyIGN1cnJlbnQgcG9zaXRpb24gaXM6IFwiICsgSlNPTi5zdHJpbmdpZnkoY3VycmVudFBvc2l0aW9uKSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydFdhdGNoKGV2ZW50KSB7XG5cbiAgaW50ZXJmYWNlIExvY2F0aW9uT2JqZWN0IHtcbiAgICBcImxhdGl0dWRlXCI6IG51bWJlcixcbiAgICBcImxvbmdpdHVkZVwiOiBudW1iZXIsXG4gICAgXCJhbHRpdHVkZVwiOiBudW1iZXIsXG4gICAgXCJob3Jpem9udGFsQWNjdXJhY3lcIjogbnVtYmVyLFxuICAgIFwidmVydGljYWxBY2N1cmFjeVwiOiBudW1iZXIsXG4gICAgXCJzcGVlZFwiOiBudW1iZXIsXG4gICAgXCJkaXJlY3Rpb25cIjogbnVtYmVyLFxuICAgIFwidGltZXN0YW1wXCI6c3RyaW5nXG4gIH1cblxuICB2YXIgbWFwVmlldyA9IGV2ZW50Lm9iamVjdDtcbiAgY3VycmVudFBvc0NpcmNsZSA9IG5ldyBtYXBzTW9kdWxlLkNpcmNsZSgpO1xuICBjdXJyZW50UG9zQ2lyY2xlLmNlbnRlciA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKDAsIDApO1xuICBjdXJyZW50UG9zQ2lyY2xlLnZpc2libGUgPSB0cnVlO1xuICBjdXJyZW50UG9zQ2lyY2xlLnJhZGl1cyA9IDIwO1xuICBjdXJyZW50UG9zQ2lyY2xlLmZpbGxDb2xvciA9IG5ldyBDb2xvcignIzZjOWRmMCcpO1xuICBjdXJyZW50UG9zQ2lyY2xlLnN0cm9rZUNvbG9yID0gbmV3IENvbG9yKCcjMzk2YWJkJyk7XG4gIGN1cnJlbnRQb3NDaXJjbGUuc3Ryb2tld2lkdGggPSAyO1xuICBjdXJyZW50UG9zQ2lyY2xlLmNsaWNrYWJsZSA9IHRydWU7XG4gIG1hcFZpZXcuYWRkQ2lyY2xlKGN1cnJlbnRQb3NDaXJjbGUpO1xuXG4gIHdhdGNoSWQgPSBnZW9sb2NhdGlvbi53YXRjaExvY2F0aW9uKFxuICBmdW5jdGlvbiAobG9jKSB7XG4gICAgICBpZiAobG9jKSB7XG4gICAgICAgICAgbGV0IG9iajogTG9jYXRpb25PYmplY3QgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGxvYykpO1xuICAgICAgICAgIHRoaXMubGF0aXR1ZGUgPSBvYmoubGF0aXR1ZGU7XG4gICAgICAgICAgdGhpcy5sb25naXR1ZGUgPSBvYmoubG9uZ2l0dWRlO1xuICAgICAgICAgIHRoaXMuYWx0aXR1ZGUgPSBvYmouYWx0aXR1ZGU7XG4gICAgICAgICAgLyp2YXIqL2N1cnJlbnRQb3NpdGlvbiA9IG1hcHNNb2R1bGUuUG9zaXRpb24ucG9zaXRpb25Gcm9tTGF0TG5nKG9iai5sYXRpdHVkZSwgb2JqLmxvbmdpdHVkZSk7XG4gICAgICAgICAgY29uc29sZS5sb2cobmV3IERhdGUoKSArIFwiXFxuUmVjZWl2ZWQgbG9jYXRpb246XFxuXFx0TGF0aXR1ZGU6IFwiICsgb2JqLmxhdGl0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFx0TG9uZ2l0dWRlOiBcIiArIG9iai5sb25naXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRBbHRpdHVkZTogXCIgKyBvYmouYWx0aXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICsgXCJcXG5cXHRUaW1lc3RhbXA6IFwiICsgb2JqLnRpbWVzdGFtcFxuICAgICAgICAgICAgICAgICAgICAgICAgKyBcIlxcblxcdERpcmVjdGlvbjogXCIgKyBvYmouZGlyZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICArIFwiXFxuXFxuQ3VycmVudFBvczogXCIgKyBKU09OLnN0cmluZ2lmeShjdXJyZW50UG9zaXRpb24pKTtcblxuICAgICAgICAgIGN1cnJlbnRQb3NDaXJjbGUuY2VudGVyID0gbWFwc01vZHVsZS5Qb3NpdGlvbi5wb3NpdGlvbkZyb21MYXRMbmcodGhpcy5sYXRpdHVkZSwgdGhpcy5sb25naXR1ZGUpO1xuXG4gICAgICAgICAgbWFwVmlldy5sYXRpdHVkZSA9IHRoaXMubGF0aXR1ZGU7XG4gICAgICAgICAgbWFwVmlldy5sb25naXR1ZGUgPSB0aGlzLmxvbmdpdHVkZTtcbiAgICAgIH1cbiAgfSxcbiAgZnVuY3Rpb24oZSl7XG4gICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIGUubWVzc2FnZSk7XG4gIH0sXG4gIHtkZXNpcmVkQWNjdXJhY3k6IDMsIHVwZGF0ZURpc3RhbmNlOiAxMCwgbWluaW11bVVwZGF0ZVRpbWUgOiAxMDAwICogMn0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kV2F0Y2goKSB7XG4gICAgaWYgKHdhdGNoSWQpIHtcbiAgICAgICAgZ2VvbG9jYXRpb24uY2xlYXJXYXRjaCh3YXRjaElkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJNeSB3YXRjaCBpcyBlbmRlZC4uLiBULiBKb24gU25vd1wiKTtcbiAgICB9XG59XG5cbi8vIFRPRE86IHRvaW1pbWFhbiBhbmRyb2lkaWxsZSBrYW5zc2FcbmZ1bmN0aW9uIGdldERpc3RhbmNlVG8ob2JqKSB7XG4gIGxldCBvYmpQb3MgPSBKU09OLnN0cmluZ2lmeShvYmoucG9zaXRpb24pO1xuICBsZXQgY3VycmVudFBvcyA9IEpTT04uc3RyaW5naWZ5KGN1cnJlbnRQb3NpdGlvbik7XG4gIGxldCBkaXN0YW5jZSA9IG51bGw7XG5cbiAgaWYoaXNJT1MpIHtcbiAgICAvL2NvbnNvbGUubG9nKFwiUnVubmluZyBvbiBpb3MuXCIpXG4gICAgZGlzdGFuY2UgPSBnZW9sb2NhdGlvbi5kaXN0YW5jZShKU09OLnBhcnNlKG9ialBvcykuX2lvcywgSlNPTi5wYXJzZShjdXJyZW50UG9zKS5faW9zKTtcbiAgfSBlbHNlIGlmKGlzQW5kcm9pZCkge1xuICAgIGNvbnNvbGUubG9nKFwiUnVubmluZyBvbiBhbmRyb2lkLlwiKTtcbiAgICBkaXN0YW5jZSA9IDM7Ly9nZW9sb2NhdGlvbi5kaXN0YW5jZShKU09OLnBhcnNlKG9ialBvcykuX2FuZHJvaWQsIEpTT04ucGFyc2UoY3VycmVudFBvcykuX2FuZHJvaWQpO1xuICB9IGVsc2Uge1xuICAgIGRpc3RhbmNlID0gXCJlcnJvclwiO1xuICAgIGNvbnNvbGUubG9nKFwiQ291bGQgbm90IGZpbmQgZGlzdGFuY2UuXCIpO1xuICB9XG4gICAgcmV0dXJuIGRpc3RhbmNlO1xufVxuXG5mdW5jdGlvbiBob3dNYW55Q29sbGVjdGVkKCkge1xuICByZXR1cm4gY29sbGVjdGVkTWFya2Vycy5sZW5ndGggKyAxO1xufVxuXG4vL2hhbmRsZXMgdGhlIGNvbGxlY3Rpb24gYW5kIHJldHVybnMgbWVzc2FnZVxuZnVuY3Rpb24gY29sbGVjdChhbW91bnQpIHtcbiAgZGlhbG9nc01vZHVsZS5hbGVydCh7XG4gICAgbWVzc2FnZTogXCJXZW50dXJlIHBvaW50IGNvbGxlY3RlZCEgXFxuWW91IGhhdmU6IFwiICsgYW1vdW50LFxuICAgIG9rQnV0dG9uVGV4dDogXCJPS1wiXG4gIH0pO1xufVxuIl19