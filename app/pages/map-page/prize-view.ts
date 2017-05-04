import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { Label } from "ui/label";
import { PrizeService } from "../../shared/prize/prize.service";
import { WenturePointService } from "../../shared/wenturepoint/wenturepoint.service";

// >> passing-parameters
@Component({
    moduleId: module.id,
    providers: [PrizeService, WenturePointService],
    templateUrl: "./prize-view.html",
    styleUrls: ["./prize-view-common.css", "./prize-view.css"]
})
export class PrizeViewComponent implements OnInit {
  wenturePointTitle: string;
  marker: any;

  constructor(private params: ModalDialogParams, private page: Page, private prizeService: PrizeService, private wenturePointService: WenturePointService) {
      this.marker = params.context;
      this.setTextViews();
  }

  ngOnInit() {
    this.page.backgroundImage = "res://loginbg";
    this.wenturePointTitle = this.marker.title;
  }

  setTextViews() {
    
  }

  public submit() {
    let label: Label = <Label>this.page.getViewById<Label>("markerTitle");
    this.params.closeCallback(label);
  }
}
