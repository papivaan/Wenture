import { Observable, EventData } from "data/observable";
import { ObservableArray } from "data/observable-array";
import { Prize } from "../../shared/prize/prize";

export class PrizeService extends Observable {
    prizes: ObservableArray<Prize>;

    constructor() {
      super();

      this.prizes = new ObservableArray<Prize>([ ]);
    }

    getPrizes() {
      return this.prizes;
    }

    getPrizesString() {
        return this.prizes.toString();
    }

    populate() {
      this.prizes.push(
        new Prize("Fonum", "-15% from products", "12/2017")
      );
      this.prizes.push(
        new Prize("Matsi Bar", "0.5l beer from tap 2 €", "10/2017")
      );
    }
}
