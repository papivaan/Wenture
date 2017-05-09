import { platformNativeScriptDynamic } from "nativescript-angular/platform";
import { setStatusBarColors } from "./utils/status-bar-util";
import * as platform from "platform";
import { AppModule } from "./app.module";
import {User} from "./shared/user/user";
import {WenturePointService} from "./shared/wenturepoint/wenturepoint.service";
import {PrizeService} from "./shared/prize/prize.service";

declare var GMSServices: any;
global.loggedUser;
// TODO: Näiden toiminta pitää tarkastaa. Ideana, että nää servicet ois globaaleja ja ettei aina alusteta uutta. Ei mitään hajua toimiiko :-DD
global.wenturePointService = new WenturePointService();
global.prizeService = new PrizeService();


if (platform.isIOS) {
  GMSServices.provideAPIKey("AIzaSyDkKXNhapUHrhdpo_GUqWfuv8nooR9zPyc");
}


setStatusBarColors();
platformNativeScriptDynamic().bootstrapModule(AppModule);
