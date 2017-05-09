import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { Label } from "ui/label";
import { PrizeService } from "../../shared/prize/prize.service";
import { WenturePointService } from "../../shared/wenturepoint/wenturepoint.service";
import {forEach} from "@angular/router/src/utils/collection";

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
  prizeName: string = "";
  prizeOffer: string = "";
  prizeValid: string = "";
  prizeId: number = null;

  constructor(private params: ModalDialogParams, private page: Page, private prizeService: PrizeService, private wenturePointService: WenturePointService) {
      this.marker = params.context;
      this.setTextViews();
  }

  ngOnInit() {
    this.page.backgroundImage = "res://loginbg";
  }

  public setTextViews() {
        this.wenturePointTitle = this.marker.title;

        for (var i = 0; i < this.wenturePointService.getPoints().length; i++) {
          console.log("Title: " + this.wenturePointService.getPoints().getItem(i).title + ", OfferId: " + this.wenturePointService.getPoints().getItem(i).prizeId);
          if (this.marker.title === this.wenturePointService.getPoints().getItem(i).title) {
            for (var j = 0; j < this.prizeService.getPrizes().length; j++) {
              console.log("Prize: " + this.prizeService.getPrizes().getItem(j).name);
              if (this.wenturePointService.getPoints().getItem(i).prizeId === this.prizeService.getPrizes().getItem(j).id) {
                  this.prizeId = this.prizeService.getPrizes().getItem(j).id;
                  this.prizeId = 666;
                  this.prizeName = this.prizeService.getPrizes().getItem(j).name;
                  this.prizeOffer = this.prizeService.getPrizes().getItem(j).offer;
                  this.prizeValid = this.prizeService.getPrizes().getItem(j).validUntil;
                  return;
              }
            }
          }
        }

  }

  public submit() {
    console.log("Prize ID: " + this.prizeId);
    this.params.closeCallback(this.prizeId);
  }
}