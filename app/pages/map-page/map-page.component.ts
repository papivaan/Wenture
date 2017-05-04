import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { isAndroid, isIOS } from "platform";
import {registerElement} from "nativescript-angular/element-registry";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import * as geolocation from "nativescript-geolocation";
import { Router } from "@angular/router";
import { Page } from "ui/page";
import { Color } from "color";
//import { Image } from "ui/image";
import { ImageSource } from "image-source";
import { WenturePoint } from "../../shared/wenturepoint/wenturepoint";
import { WenturePointService } from "../../shared/wenturepoint/wenturepoint.service";
import { TnsSideDrawer } from 'nativescript-sidedrawer';
import { PrizeViewComponent } from "./prize-view";

var mapsModule = require("nativescript-google-maps-sdk");
var dialogsModule = require("ui/dialogs");
var Image = require("ui/image").Image;
var imageSource = require("image-source");

var watchId: any;
var currentPosition: Location;
var currentPosCircle: any;
var collectDistance: number; //distance in m on how close to enable collect-property
var mapView: any;
var collectedMarkers = [];

registerElement("MapView", () => require("nativescript-google-maps-sdk").MapView);

@Component({
  selector: "map-page",
  providers: [WenturePointService, ModalDialogService],
  templateUrl: "pages/map-page/map-page.html",
  styleUrls: ["pages/map-page/map-page-common.css", "pages/map-page/map-page.css"]
})


export class MapPageComponent implements OnInit {
  @ViewChild("MapView") mapView: ElementRef;

  latitude: number;
  longitude: number;
  altitude: number;
  wenturePointTitle: string;
  wenturePointInfo: string;
  markerIsSelected: boolean;
  //i stores the index value of menu
  i: number = 0;

  constructor(private router: Router, private wenturePointService: WenturePointService, private page: Page, private _modalService: ModalDialogService, private vcRef: ViewContainerRef) {

  }

  ngOnInit() {
    // TODO: Loader?
    // TODO: menuitem iconit puuttuu, actionbarin mahd piilottaminen(?)
    TnsSideDrawer.build({
      templates: [{
          title: 'Wenturepoints',
          //androidIcon: 'ic_home_white_24dp',
          //iosIcon: 'ic_home_white',
      }, {
          title: 'Routes',
          //androidIcon: 'ic_gavel_white_24dp',
          //iosIcon: 'ic_gavel_white',
      }, {
          title: 'My Wentures',
          //androidIcon: 'ic_account_balance_white_24dp',
          //iosIcon: 'ic_account_balance_white',
      }, {
          title: 'Settings',
        //  androidIcon: 'ic_build_white_24dp',
        //  iosIcon: 'ic_build_white',
      }, {
          title: 'Log out',
        //  androidIcon: 'ic_account_circle_white_24dp',
        //  iosIcon: 'ic_account_circle_white',
      }],
      title: 'Wenture',
      subtitle: 'your urban adventure!',
      listener: (index) => {
          this.i = index
      },
      context: this,
    });

  }

  toggleSideDrawer() {
    TnsSideDrawer.toggle();
  }

  createModelView() {
    let that = this;
    let options: ModalDialogOptions = {
        viewContainerRef: this.vcRef,
        context: "Context",
        fullscreen: true
    };
    // >> returning-result
    this._modalService.showModal(PrizeViewComponent, options)
        .then((/* */) => {
            console.log("Kukkuu");
            // >> (hide)
            /*
            if (args === "start") {
                this.startDate = dateresult;
            } else if (args === "end") {
                this.endDate = dateresult;
            } else if (args === "findTheDay") {
                this.date = dateresult;
                this.weekday = this.weekdays[this.date.getDay()];
            }
            */
            // << (hide)
        });
    // << returning-result
  }

  collectButtonTapped() {
    // TODO: Tähän se keräystoiminto, if distance jtn, niin tuolta toi collect()
    alert("Not yet implemented.");
  }

  addWenturePoints(mapView) {
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
      marker.userData = {index: 1};
      mapView.addMarker(marker);

    }
  }

  //Map events
  onMapReady = (event) => {
    console.log("Map Ready");
    startWatch(event);

    // Check if location services are enabled
    if (!geolocation.isEnabled()) {
        geolocation.enableLocationRequest();
    } else console.log("Alles in Ordnung");

    var mapView = event.object;
    var gMap = mapView.gMap;

    this.addWenturePoints(mapView);

  };

  onCoordinateTapped = (event) => {
    var mapView = event.object;
    this.wenturePointTitle = "";
    this.wenturePointInfo = "";
    console.log("Coordinate tapped.");
    this.markerIsSelected = false;
  };

  onCoordinateLongPress = (event) => {
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
    this.createModelView();
  };

  // TODO: Tämän voisi siirtää johonkin fiksumpaan paikkaan.
  TnsSideDrawerOptionsListener = (index) => {
    console.log(index)
  };

  onMarkerSelect = (event) => {

    interface PositionObject {
      "latitude": string,
      "longitude": string
    }

    var mapView = event.object;

    let markerPos = JSON.stringify(event.marker.position);
    let currentPos = JSON.stringify(currentPosition);
    let distance = getDistanceTo(event.marker);

    // Make bottom bar visible
    this.markerIsSelected = true;

    // Change the content of the bottom bar text
    this.wenturePointTitle = event.marker.title;

    for (var i = 0; i < this.wenturePointService.getPoints().length; i++) {
      if (event.marker.title === this.wenturePointService.getPoints().getItem(i).title) {
        this.wenturePointInfo = this.wenturePointService.getPoints().getItem(i).info;
        console.log("\t" + this.wenturePointService.getPoints().getItem(i).info);
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
      if(getDistanceTo(mark) < collectDistance) {
        let amount = howManyCollected();
        collect(amount );
        //alert("Venture point collected. \nCollected: " + amount);
        collectedMarkers.push(mark);
        mapView.removeMarker(mark);
        console.log("You have " + collectedMarkers.length + " collected markers.")
      } else {
        console.log("\nMarker too far away, move closer.");
      }
    }

    collectMarker(event.marker);

  };

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
    console.log("CameraChange");
    console.log("Wenture Points:");
    for (var i = 0; i < this.wenturePointService.getPoints().length; i++) {
      console.log("\t" + JSON.stringify(this.wenturePointService.getPoints().getItem(i)));
    }
  };

  onShapeSelect = (event) => {
    console.log("Your current position is: " + JSON.stringify(currentPosition));
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

  var mapView = event.object;
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
          /*var*/currentPosition = mapsModule.Position.positionFromLatLng(obj.latitude, obj.longitude);
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
  },
  function(e){
      console.log("Error: " + e.message);
  },
  {desiredAccuracy: 3, updateDistance: 10, minimumUpdateTime : 1000 * 2});
}

export function endWatch() {
    if (watchId) {
        geolocation.clearWatch(watchId);
        console.log("My watch is ended... T. Jon Snow");
    }
}

// TODO: toimimaan androidille kanssa
function getDistanceTo(obj) {
  let objPos = JSON.stringify(obj.position);
  let currentPos = JSON.stringify(currentPosition);
  let distance = null;

  if(isIOS) {
    //console.log("Running on ios.")
    distance = geolocation.distance(JSON.parse(objPos)._ios, JSON.parse(currentPos)._ios);
  } else if(isAndroid) {
    console.log("Running on android.");
    distance = 3;//geolocation.distance(JSON.parse(objPos)._android, JSON.parse(currentPos)._android);
  } else {
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
