var Image = require("ui/image").Image;

var nextId = 0;

export class WenturePoint {
  id: number;
  // Not sure if the image works like this
  //image: Image;

  constructor(public title: string, public lat: number, public lng: number, public info: string) {
    this.id = nextId++;
  }
}
