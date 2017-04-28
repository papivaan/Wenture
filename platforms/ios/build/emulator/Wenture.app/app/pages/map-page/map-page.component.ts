import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { isAndroid, isIOS } from "platform";
import {registerElement} from "nativescript-angular/element-registry";
import * as geolocation from "nativescript-geolocation";
import { Color } from "color";
//import { Image } from "ui/image";
import { ImageSource } from "image-source";

var mapsModule = require("nativescript-google-maps-sdk");
var dialogsModule = require("ui/dialogs");
var Image = require("ui/image").Image;
var imageSource = require("image-source");



var watchId: any;
var currentPosition: Location;
var collectDistance: number; //distance in m on how close to enable collect-property
var mapView: any;
var collectedMarkers = [];
//var _currentPosition: any;

registerElement("MapView", () => require("nativescript-google-maps-sdk").MapView);

@Component({
  selector: "map-page",
  templateUrl: "pages/map-page/map-page.html",
  styleUrls: ["pages/map-page/map-page-common.css", "pages/map-page/map-page.css"]
})

/*export function public startWatch() {
    var watchId = geolocation.watchLocation(
    function (loc) {
        if (loc) {
            console.log("Received location: " + loc);
        }
    },
    function(e){
        console.log("Error: " + e.message);
    },
    {desiredAccuracy: 3, updateDistance: 10, minimumUpdateTime : 1000 * 20}); // Should update every 20 seconds according to Googe documentation. Not verified.
}*/

export class MapPageComponent implements OnInit {
  @ViewChild("MapView") mapView: ElementRef;

  latitude: number;
  longitude: number;
  altitude: number;
  _currentPosition: any;

  ngOnInit() {
    // TODO: Loader
    //this.startWatch();
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

    var marker = new mapsModule.Marker();
    marker.position = mapsModule.Position.positionFromLatLng(62.2308912, 25.7343853);
    marker.title = "Mattilanniemi";
    marker.snippet = "University Campus";
    var icon = new Image();
    icon.imageSource = imageSource.fromResource('icon');
    marker.icon = icon;
    marker.userData = {index: 1};
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

  onCoordinateLongPress = (event) => {
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
    marker.userData = {index: 1};
    mapView.addMarker(marker);
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
        collect(amount);
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

          var circle = new mapsModule.Circle();
          circle.center = mapsModule.Position.positionFromLatLng(this.latitude, this.longitude);
          circle.visible = true;
          circle.radius = 20;
          circle.fillColor = new Color('#6c9df0'); //#99ff8800
          circle.strokeColor = new Color('#396abd'); //#99ff0000
          circle.strokeWidth = 2;
          circle.clickable = true;
          mapView.addCircle(circle);
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
