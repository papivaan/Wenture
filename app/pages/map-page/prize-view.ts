import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";

// >> passing-parameters
@Component({
    moduleId: module.id,
    templateUrl: "./prize-view.html",
})
export class PrizeViewComponent implements OnInit {

    constructor(private params: ModalDialogParams, private page: Page) {
        console.log("ModalViewComponent constructed");
    }

    ngOnInit() {
        console.log("ngOnInit");
    }

    public submit() {
        this.params.closeCallback("Callback param");
    }
}
