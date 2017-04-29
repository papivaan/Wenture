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

  populate() {
    this.points.push(
      new WenturePoint("Mattilanniemi", 62.24, 25.75)
    );
  }

}
