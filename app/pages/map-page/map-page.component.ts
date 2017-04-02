import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {registerElement} from "nativescript-angular/element-registry";

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
    global.console.log("Map Ready");
    // TODO: Set marker etc.
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
