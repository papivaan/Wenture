import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {registerElement} from "nativescript-angular/element-registry";
import geolocation = require("nativescript-geolocation");
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

    var marker = new mapsModule.Marker();
    marker.position = mapsModule.Position.positionFromLatLng(62.2308912, 25.7343853);
    marker.title = "Sydney";
    marker.snippet = "Australia";
    marker.userData = {index: 1};
    mapView.addMarker(marker);

    var location = geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000}).
    then(function(loc) {
      if (loc) {
        console.log("Current location is: " + loc);
      }
    }, function(e){
      console.log("Error: " + e.message);
    });
  };
  onMarkerSelect = (event) => {
    console.log("MarkerSelect");
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
