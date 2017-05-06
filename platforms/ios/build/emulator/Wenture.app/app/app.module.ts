import { NgModule } from "@angular/core";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { NativeScriptModule } from "nativescript-angular/platform";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { TNSFontIconModule } from 'nativescript-ngx-fonticon';

import { PrizeViewComponent } from "./pages/map-page/prize-view";
import { AppComponent } from "./app.component";
import { routes, navigatableComponents } from "./app.routing";

@NgModule({
  imports: [
    NativeScriptModule,
    NativeScriptFormsModule,
    NativeScriptHttpModule,
    NativeScriptRouterModule,
    NativeScriptRouterModule.forRoot(routes),
    TNSFontIconModule.forRoot({
			'fa': './assets/font-awesome.css'
		})
  ],
  declarations: [
    AppComponent,
    PrizeViewComponent,
    ...navigatableComponents
  ],
  entryComponents: [PrizeViewComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
