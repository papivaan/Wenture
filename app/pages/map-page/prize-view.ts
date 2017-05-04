import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { Label } from "ui/label";

// >> passing-parameters
@Component({
    moduleId: module.id,
    templateUrl: "./prize-view.html",
    styleUrls: "./prize-view.css"
})
export class PrizeViewComponent implements OnInit {
  wenturePointTitle: string;

  constructor(private params: ModalDialogParams, private page: Page) {
      console.log("ModalViewComponent constructed");
  }

  ngOnInit() {
    this.wenturePointTitle = "Hiphei mäyrät!";
    console.log("ngOnInit");
  }

  public submit() {
    let label: Label = <Label>this.page.getViewById<Label>("markerTitle");
    this.params.closeCallback(label);
  }
}
