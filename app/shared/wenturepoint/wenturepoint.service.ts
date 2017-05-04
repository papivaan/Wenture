import { Observable, EventData } from "data/observable";
import { ObservableArray } from "data/observable-array";
import { WenturePoint } from "../../shared/wenturepoint/wenturepoint";

export class WenturePointService extends Observable {
  points: ObservableArray<WenturePoint>;

  constructor () {
    super();

    this.points = new ObservableArray<WenturePoint>([ ]);
    this.populate();
  }

  getPoints() {
    return this.points;
  }

  public populate() {
    this.points.push(
      new WenturePoint("Dumpin toimisto", 62.232615, 25.737668, "Loistava paikka dumppareille piipahtaa pikkaselle kahville!", 0)
    );
    this.points.push(
      new WenturePoint("Kompassi", 62.242640, 25.747362, "Kohtaamispaikka keskellä kaupunkia. Jyväskylän keskipiste.", 1)
    );
    this.points.push(
      new WenturePoint("Escape", 62.243915, 25.750180, "Yökerhon eliittiä.", 0)
    );
    this.points.push(
      new WenturePoint("Yritystehdas", 62.247596, 25.741710, "Täällä rakennettaan yrittäjiä!", 1)
    );
  }

}
