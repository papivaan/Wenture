import { Observable, EventData } from "data/observable";
import { ObservableArray } from "data/observable-array";
import { WenturePoint } from "../../shared/wenturepoint/wenturepoint";

export class WenturePointService extends Observable {
  points: ObservableArray<string>;

  constructor () {
    super();

    this.points = new ObservableArray<string>([
      'Mattilanniemi',
      'Kompassi',
      'Escape'
    ]);
  }

  setPoints() {
    this.points.push("Kukkuu");
  }

  getPoints() {
    return this.points;
  }

}
