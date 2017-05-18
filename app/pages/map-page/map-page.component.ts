import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { isAndroid, isIOS } from "platform";
import { registerElement } from "nativescript-angular/element-registry";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import * as geolocation from "nativescript-geolocation";
import { TNSFontIconService } from 'nativescript-ngx-fonticon';
import { Router } from "@angular/router";
import { Page } from "ui/page";
import { Color } from "color";
import { WenturePointService } from "../../shared/wenturepoint/wenturepoint.service";
import { PrizeService } from "../../shared/prize/prize.service";
import { TnsSideDrawer } from 'nativescript-sidedrawer';
import { PrizeViewComponent } from "./prize-view";

let mapsModule = require("nativescript-google-maps-sdk");
let Image = require("ui/image").Image;
let imageSource = require("image-source");

let watchId: any;
let currentPosition: Location;
let currentPosCircle: any;
let collectDistance: number = 50; // How close the user needs to be in order to collect marker
let mapView: any;
let collectedMarkers = [];
let selectedMarker;

// Latitude and longitude for android distance workaround
let androidLat;
let androidLng;

registerElement("MapView", () => require("nativescript-google-maps-sdk").MapView);

@Component({
  selector: "map-page",
  providers: [WenturePointService, PrizeService, ModalDialogService],
  templateUrl: "pages/map-page/map-page.html",
  styleUrls: ["pages/map-page/map-page-common.css", "pages/map-page/map-page.css"]
})


export class MapPageComponent implements OnInit {
    @ViewChild("MapView") mapView: ElementRef;
    @ViewChild("collectButton") collectButton: ElementRef;

    wenturePointTitle: string;
    wenturePointInfo: string;
    markerIsSelected: boolean;
    isCloseEnoughToCollect: boolean;

    private _menuIndex: number = 0;

    constructor(private router: Router,
              private fonticon: TNSFontIconService,
              private page: Page,
              private _modalService: ModalDialogService,
              private vcRef: ViewContainerRef) {

        global.prizeService.populate();
        global.wenturePointService.populate();
    }


    ngOnInit() {
        TnsSideDrawer.build({
            templates: [{
                title: 'Wenturepoints'
            }, {
                title: 'Routes'
            }, {
                title: 'My Prizes'
            }, {
                title: 'Settings'
            }, {
                title: 'Log out'
            }],
            textColor: new Color("white"),
            headerBackgroundColor: new Color("#383838"),
            backgroundColor: new Color("#282828"),
            logoImage: imageSource.fromResource('icon'),
            title: 'Wenture',
            subtitle: 'your urban adventure!',
            listener: (index) => {
                this.menuIndex = index
            },
            context: this,
        });
    }

    get menuIndex(): number {
      return this._menuIndex;
    }

    set menuIndex(menuIndex: number) {
        this._menuIndex = menuIndex;
        this.menuListener(menuIndex);
    }

    menuListener(index) {
        this.page.actionBarHidden = false;

        switch(index) {
            case 1: {
                alert("Routes are yet to come");
                break;
            }

            case 2: {
                alert("Prize list is yet to come")
                break;
            }

            case 3: {
                alert("Settings are yet to come")
                break;
            }

            case 4: {
                this.router.navigate(["/"]);
                global.loggedUser = null;
                break;
            }
        }
    }

    toggleSideDrawer() {
        TnsSideDrawer.toggle();
        this.page.actionBarHidden = true;
    }

    collectButtonTapped() {
        this.collect(selectedMarker);
        collectedMarkers.push(selectedMarker);
        mapView.removeMarker(selectedMarker);
    }

    collect(marker) {
        this.createModelView(marker);
    }

    createModelView(mark) {
        let options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: mark,
            fullscreen: true
        };
        // >> returning-result
        this._modalService.showModal(PrizeViewComponent, options)
            .then((prizeId) => {
                // TODO: Remove that god damn marker
                let tempUser = global.loggedUser;
                tempUser.prizes.push(prizeId);
                global.loggedUser = tempUser;
                this.markerIsSelected = false;

                console.log(prizeId);
                console.log("User: " + global.loggedUser.email +
                    "\nPassword: " + global.loggedUser.password +
                    "\nPrizes: " + global.loggedUser.prizes);
            });
        // << returning-result
    }

    onMapReady = (event) => {
        startWatch(event);

        if (!geolocation.isEnabled()) {
            geolocation.enableLocationRequest();
        } else {
            console.log("Location services enabled.");
        }

        mapView = event.object;

        this.addWenturePoints(mapView);
    };

    addWenturePoints(mapView) {
        for (let i = 0; i < global.wenturePointService.getPoints().length; i++) {
            let wPoint = global.wenturePointService.getPoints().getItem(i);
            let marker = new mapsModule.Marker();
            let icon = new Image();

            marker.position = mapsModule.Position.positionFromLatLng(wPoint.lat, wPoint.lng);
            marker.title = wPoint.title;
            marker.snippet = "";
            icon.imageSource = imageSource.fromResource('hat_marker');
            marker.icon = icon;
            marker.draggable = true;
            marker.userData = {index: 1};
            mapView.addMarker(marker);
        }
    }

    onCoordinateTapped = (event) => {
        mapView = event.object;
        this.wenturePointTitle = "";
        this.wenturePointInfo = "";
        this.markerIsSelected = false;
        this.page.actionBarHidden = false;
    };

    onCoordinateLongPress = (event) => {

    };

    onMarkerSelect = (event) => {
        let distance = this.getDistanceTo(event.marker);

        this.markerIsSelected = true;
        this.wenturePointTitle = event.marker.title;
        for (let i = 0; i < global.wenturePointService.getPoints().length; i++) {
            if (event.marker.title === global.wenturePointService.getPoints().getItem(i).title) {
                this.wenturePointInfo = global.wenturePointService.getPoints().getItem(i).info;
            }
        }

        event.marker.snippet = "Distance: " + distance.toFixed(0) + " m";
        this.isCloseEnoughToCollect = distance < collectDistance;

        selectedMarker = event.marker;
    };

    getDistanceTo(obj) {

        let distance = null;

        if(isIOS) {
            let objPos = JSON.stringify(obj.position);
            let currentPos = JSON.stringify(currentPosition);

            distance = geolocation.distance(JSON.parse(objPos)._ios, JSON.parse(currentPos)._ios);
        } else if(isAndroid) {
            //parameter order = lat1, lat2, lon1, lon2
            let d = this.getDistanceFromLatLng(obj.position.latitude, obj.position.longitude, androidLat, androidLng);
            //multiply by 1000 to get d in meters
            distance = d * 1000;

        } else {
            distance = "error";
            console.log("Could not find distance.");
        }
        return distance;
    }

    /*
     Uses Haversine formula to calculate distance of two locations
     NOT taking into account that earth is not a perfect sphere!
     Return unit is km
     */
    getDistanceFromLatLng(lat1, lon1, lat2, lon2) {
    let R = 6371; // km , earth's mean radius

    let dLat = this.degToRad(lat2-lat1);
    let dLon = this.degToRad(lon2-lon1);

    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c;
    return d;
    }

    degToRad(deg) {
        return deg * (Math.PI / 180);
    }

    onMarkerBeginDragging = (event) => {
        console.log("MarkerBeginDragging");
    };

    onMarkerEndDragging = (event) => {
        console.log("MarkerEndDragging");
    };

    onMarkerDrag = (event) => {
        console.log("MarkerDrag");
    };

    onCameraChanged = (event) => {

    };

    onShapeSelect = (event) => {
        console.log("Shape selected.");
    };
}

export function startWatch(event) {

  interface LocationObject {
    "latitude": number,
    "longitude": number,
    "altitude": number,
    "horizontalAccuracy": number,
    "verticalAccuracy": number,
    "speed": number,
    "direction": number,
    "timestamp":string
  }

  let mapView = event.object;
  currentPosCircle = new mapsModule.Circle();
  currentPosCircle.center = mapsModule.Position.positionFromLatLng(0, 0);
  currentPosCircle.visible = true;
  currentPosCircle.radius = 20;
  currentPosCircle.fillColor = new Color('#6c9df0');
  currentPosCircle.strokeColor = new Color('#396abd');
  currentPosCircle.strokewidth = 2;
  currentPosCircle.clickable = true;
  mapView.addCircle(currentPosCircle);

  watchId = geolocation.watchLocation(
  function (loc) {
      if (loc) {
          let obj: LocationObject = JSON.parse(JSON.stringify(loc));
          this.latitude = obj.latitude;
          this.longitude = obj.longitude;
          this.altitude = obj.altitude;

          // Latitude and longitude for android distance workaround
          androidLat = obj.latitude;
          androidLng = obj.longitude;

          currentPosition = mapsModule.Position.positionFromLatLng(obj.latitude, obj.longitude);

          currentPosCircle.center = mapsModule.Position.positionFromLatLng(this.latitude, this.longitude);

          mapView.latitude = this.latitude;
          mapView.longitude = this.longitude;
      }
  },
  function(e){
      console.log("Error: " + e.message);
  },
  {desiredAccuracy: 3, updateDistance: 10, minimumUpdateTime : 500 * 2});
}
