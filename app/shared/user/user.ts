import {ObservableArray} from "data/observable-array";
var validator = require("email-validator");

export class User {
  email: string;
  password: string;
  prizes: ObservableArray<number>;

  constructor() {
      this.prizes = new ObservableArray<number>([ ]);
  }

  isValidEmail() {
    return validator.validate(this.email);
  }
}
