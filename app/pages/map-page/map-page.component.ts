import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {registerElement} from "nativescript-angular/element-registry";
import * as geolocation from "nativescript-geolocation";

var mapsModule = require("nativescript-google-maps-sdk");

registerElement("MapView", () => require("nativescript-google-maps-sdk").MapView);

@Component({
  selector: "map-page",
  templateUrl: "pages/map-page/map-page.html",
  styleUrls: ["pages/map-page/map-page-common.css", "pages/map-page/map-page.css"]
})

export class MapPageComponent implements OnInit {
  @ViewChild("MapView") mapView: ElementRef;

  ngOnInit() {
    // TODO: Loader
  }

  //Map events
  onMapReady = (event) => {
    console.log("Map Ready");
    // TODO: Set marker etc.

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

  };
  onCoordinateLongPress = (event) => {
    console.log("LongPress");

    var mapView = event.object;
    var lat = event.position.latitude;
    var lng = event.position.longitude;

    console.log("Tapped location: Latitude: " + event.position.latitude +
                    ", Longtitude: " + event.position.longitude);

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
