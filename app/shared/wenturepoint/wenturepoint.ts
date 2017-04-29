var Image = require("ui/image").Image;

export class WenturePoint {
  id: number;
  title: string;
  snippet: string;
  lat: number;
  lng: number;
  nextId = 0;
  // Not sure if the image works like this
  //image: Image;

  constructor(public titlename: string, public latitude: number, public longitude: number) {
    this.id = this.nextId++;
    this.title = titlename;
    this.lat = latitude;
    this.lng = longitude;
  }
}
