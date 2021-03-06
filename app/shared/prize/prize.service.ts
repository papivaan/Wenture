import { Observable, EventData } from "data/observable";
import { ObservableArray } from "data/observable-array";
import { Prize } from "../../shared/prize/prize";

export class PrizeService extends Observable {
    prizes: ObservableArray<Prize>;

    constructor() {
      super();

      this.prizes = new ObservableArray<Prize>([ ]);
      this.populate();
    }

    getPrizes() {
      return this.prizes;
    }

    populate() {
      this.prizes.push(
        new Prize("One Company", "-10% from products", "12/2017")
      );
      this.prizes.push(
        new Prize("Another Inc.", "Extended free trial", "10/2017")
      );
    }
}
