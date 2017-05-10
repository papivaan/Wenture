import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Page } from "ui/page";
//import { Prize } from "../../shared/prize/prize";
//import { PrizeService } from "../../shared/prize/prize.service";

@Component({
  selector: "list",
  //providers: [PrizeService],
  templateUrl: "pages/list/list.html",
  styleUrls: ["pages/list/list-common.css", "pages/list/list.css"]
})
export class ListComponent implements OnInit {

  constructor(private page: Page) {}

  ngOnInit() {
    //this.prizeList.push({ name: "Prize1" });
    //this.prizeList.push({ name: "Prize2" });
    //this.prizeList.push({ name: "Prize3" });
  }

  /*ngOnInit() {
  this.isLoading = true;
  this.prizeListService.load()
    .subscribe(loadedPrizes => {
      loadedPrizes.forEach((prizeObject) => {
        this.prizeList.unshift(prizeObject);
      });
      this.isLoading = false;
      this.listLoaded = true;
    });*/
}
