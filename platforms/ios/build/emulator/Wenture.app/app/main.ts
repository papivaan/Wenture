import { platformNativeScriptDynamic } from "nativescript-angular/platform";
import { setStatusBarColors } from "./utils/status-bar-util";
import * as platform from "platform";
declare var GMSServices: any;

import { AppModule } from "./app.module";

if (platform.isIOS) {
  GMSServices.provideAPIKey("AIzaSyDkKXNhapUHrhdpo_GUqWfuv8nooR9zPyc");
}

setStatusBarColors();
platformNativeScriptDynamic().bootstrapModule(AppModule);
