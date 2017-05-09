import { platformNativeScriptDynamic } from "nativescript-angular/platform";
import { setStatusBarColors } from "./utils/status-bar-util";
import * as platform from "platform";
import { AppModule } from "./app.module";
import {User} from "./shared/user/user";

declare var GMSServices: any;
global.loggedUser;


if (platform.isIOS) {
  GMSServices.provideAPIKey("AIzaSyDkKXNhapUHrhdpo_GUqWfuv8nooR9zPyc");
}


setStatusBarColors();
platformNativeScriptDynamic().bootstrapModule(AppModule);
