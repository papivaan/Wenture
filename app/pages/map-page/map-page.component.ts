import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {registerElement} from "nativescript-angular/element-registry";
import * as geolocation from "nativescript-geolocation";
import { Color } from "color";

var mapsModule = require("nativescript-google-maps-sdk");

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

  ngOnInit() {
    // TODO: Loader
    //this.startWatch();
  }

  startWatch = (event) => {
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

    var watchId = geolocation.watchLocation(
    function (loc) {
        if (loc) {
            let obj: LocationObject = JSON.parse(JSON.stringify(loc));
            this.latitude = obj.latitude;
            this.longitude = obj.longitude;
            this.altitude = obj.altitude;
            console.log(new Date() + "\nReceived location:\n\tLatitude: " + obj.latitude
                          + "\n\tLongitude: " + obj.longitude
                          + "\n\tAltitude: " + obj.altitude
                          + "\n\tTimestamp: " + obj.timestamp);

            var circle = new mapsModule.Circle();
            circle.center = mapsModule.Position.positionFromLatLng(this.latitude, this.longitude);
            circle.visible = true;
            circle.radius = 20;
            circle.fillColor = new Color('#99ff8800');
            circle.strokeColor = new Color('#99ff0000');
            circle.strokeWidth = 2;
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

  //Map events
  onMapReady = (event) => {
    console.log("Map Ready");
    this.startWatch(event);

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
    marker.userData = {index: 1};
    mapView.addMarker(marker);

    var circle = new mapsModule.Circle();
    circle.center = mapsModule.Position.positionFromLatLng(62.23, 25.73);
    circle.visible = true;
    circle.radius = 50;
    circle.fillColor = new Color('#99ff8800');
    circle.strokeColor = new Color('#99ff0000');
    circle.strokeWidth = 2;
    mapView.addCircle(circle);


/*
    var location = geolocation.getCurrentLocation({
                              desiredAccuracy: 3,
                              updateDistance: 10,
                              maximumAge: 20000,
                              timeout: 20000
    }).
    then(function(loc) {
      if (loc) {
        let obj: LocationObject = JSON.parse(JSON.stringify(loc));
        console.log("Current location:\nLatitude: " + obj.latitude
                      + "\nLongitude: " + obj.longitude
                      + "\nAltitude: " + obj.altitude);
      }
    }, function(e){
      console.log("Error: " + e.message);
    });
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
    marker.title = "Mattilanniemi";
    marker.snippet = "University Campus";
    marker.userData = {index: 1};
    mapView.addMarker(marker);
  };
  onMarkerSelect = (event) => {
    console.log("MarkerSelect: " + event.marker.title);
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
}
