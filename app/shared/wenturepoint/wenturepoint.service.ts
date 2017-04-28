import observableArrayModule = require("data/observable-array");
import { WenturePoint } from "../../shared/wenturepoint/wenturepoint";



export class WenturePointService {
  list: Array<number> = [1, 2, 666];

  constructor () {}

  setPoints() {
    this.list.push(1);
  }

  getPoints() {
    return this.list;
  }

}
