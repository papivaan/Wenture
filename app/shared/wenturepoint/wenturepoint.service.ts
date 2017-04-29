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
      new WenturePoint("Dumpin toimisto", 62.232615, 25.737668)
    );
    this.points.push(
      new WenturePoint("Kompassi", 62.242640, 25.747362)
    );
    this.points.push(
      new WenturePoint("Escape", 62.243915, 25.750180)
    );
    this.points.push(
      new WenturePoint("Yritystehdas", 62.247596, 25.741710)
    );
  }

}
