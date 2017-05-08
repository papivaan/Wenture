import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { User } from "../../shared/user/user";
import { UserService } from "../../shared/user/user.service";
import { Router } from "@angular/router";
import { Page } from "ui/page";
import { Color } from "color";
import { View } from "ui/core/view";
import { setHintColor } from "../../utils/hint-util";
import { TextField } from "ui/text-field";

@Component({
  selector: "my-app",
  providers: [UserService],
  templateUrl: "pages/login/login.html",
  styleUrls: ["pages/login/login-common.css", "pages/login/login.css"]
})
export class LoginComponent implements OnInit {
  user: User;
  isLoggingIn = true;
  @ViewChild("container") container: ElementRef;
  @ViewChild("email") email: ElementRef;
  @ViewChild("password") password: ElementRef;

  constructor(private router: Router, private userService: UserService, private page: Page) {
    this.user = new User();
    this.user.email = "jalkanen@jaakko.fi";
    this.user.password = "pasipekka";
  }
  ngOnInit() {
    this.page.actionBarHidden = true;
    // TODO: Background doesn't work for some reason...
    this.page.backgroundImage = "res://loginbg";
  }
  submit() {
    if (!this.user.isValidEmail()) {
      alert("Enter a valid email address.");
      return;
    }
    if (this.isLoggingIn) {
      this.login();
    } else {
      this.signUp();
    }
  }
  login() {
    if (this.user.email === "jalkanen@jaakko.fi" && this.user.password === "pasipekka") {
      this.router.navigate(["/map-page"]);
    } else alert("Unfortunately we could not find your account.");
    /* This section is for everlive.
    this.userService.login(this.user)
      .subscribe(
        () => this.router.navigate(["/map-page"]),
        (error) => alert("Unfortunately we could not find your account.")
      );
    */
  }
  signUp() {
    alert("Registration is not yet available.")
    /* This section is for everlive.
    this.userService.register(this.user)
      .subscribe(
        () => {
          alert("Your account was successfully created.");
          this.toggleDisplay();
        },
        ()  => alert("Unfortunately we were unable to create your account.")
      );
    */
  }
  toggleDisplay() {
    this.isLoggingIn = !this.isLoggingIn;
    this.setTextFieldColors();
    let container = <View>this.container.nativeElement;
    container.animate({
      // TODO: Change the signup background color to something more appealing
      backgroundColor: this.isLoggingIn ? new Color("rgba(235, 235, 235, 0.75)") : new Color("rgba(0, 0, 0, 0.75)"),
      duration: 200
    });
  }
  setTextFieldColors() {
    let emailTextField = <TextField>this.email.nativeElement;
    let passwordTextField = <TextField>this.password.nativeElement;

    let mainTextColor = new Color(this.isLoggingIn ? "black" : "white");
    emailTextField.color = mainTextColor;
    passwordTextField.color = mainTextColor;

    let hintColor = new Color(this.isLoggingIn ? "#ACA6A7" : "#C4AFB4");
    setHintColor({ view: emailTextField, color: hintColor });
    setHintColor({ view: passwordTextField, color: hintColor });
  }
}
