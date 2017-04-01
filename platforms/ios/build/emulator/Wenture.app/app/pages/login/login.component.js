"use strict";
var core_1 = require("@angular/core");
var user_1 = require("../../shared/user/user");
var user_service_1 = require("../../shared/user/user.service");
var router_1 = require("@angular/router");
var page_1 = require("ui/page");
var color_1 = require("color");
var hint_util_1 = require("../../utils/hint-util");
var LoginComponent = (function () {
    function LoginComponent(router, userService, page) {
        this.router = router;
        this.userService = userService;
        this.page = page;
        this.isLoggingIn = true;
        this.user = new user_1.User();
        //this.user.email = "user@nativescript.org";
        //this.user.password = "password";
    }
    LoginComponent.prototype.ngOnInit = function () {
        this.page.actionBarHidden = true;
        // TODO: Background doesn't work for some reason...
        this.page.backgroundImage = "res://loginbg";
    };
    LoginComponent.prototype.submit = function () {
        if (!this.user.isValidEmail()) {
            alert("Enter a valid email address.");
            return;
        }
        if (this.isLoggingIn) {
            this.login();
        }
        else {
            this.signUp();
        }
    };
    LoginComponent.prototype.login = function () {
        if (this.user.email === "jalkanen@jaakko.fi" && this.user.password === "pasipekka") {
            this.router.navigate(["/map-page"]);
        }
        else
            alert("Unfortunately we could not find your account.");
        /* This section is for everlive.
        this.userService.login(this.user)
          .subscribe(
            () => this.router.navigate(["/map-page"]),
            (error) => alert("Unfortunately we could not find your account.")
          );
        */
    };
    LoginComponent.prototype.signUp = function () {
        alert("Registration is not yet available.");
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
    };
    LoginComponent.prototype.toggleDisplay = function () {
        this.isLoggingIn = !this.isLoggingIn;
        this.setTextFieldColors();
        var container = this.container.nativeElement;
        container.animate({
            backgroundColor: this.isLoggingIn ? new color_1.Color("white") : new color_1.Color("#595459"),
            duration: 200
        });
    };
    LoginComponent.prototype.setTextFieldColors = function () {
        var emailTextField = this.email.nativeElement;
        var passwordTextField = this.password.nativeElement;
        var mainTextColor = new color_1.Color(this.isLoggingIn ? "black" : "white");
        emailTextField.color = mainTextColor;
        passwordTextField.color = mainTextColor;
        var hintColor = new color_1.Color(this.isLoggingIn ? "#ACA6A7" : "#C4AFB4");
        hint_util_1.setHintColor({ view: emailTextField, color: hintColor });
        hint_util_1.setHintColor({ view: passwordTextField, color: hintColor });
    };
    return LoginComponent;
}());
__decorate([
    core_1.ViewChild("container"),
    __metadata("design:type", core_1.ElementRef)
], LoginComponent.prototype, "container", void 0);
__decorate([
    core_1.ViewChild("email"),
    __metadata("design:type", core_1.ElementRef)
], LoginComponent.prototype, "email", void 0);
__decorate([
    core_1.ViewChild("password"),
    __metadata("design:type", core_1.ElementRef)
], LoginComponent.prototype, "password", void 0);
LoginComponent = __decorate([
    core_1.Component({
        selector: "my-app",
        providers: [user_service_1.UserService],
        templateUrl: "pages/login/login.html",
        styleUrls: ["pages/login/login-common.css", "pages/login/login.css"]
    }),
    __metadata("design:paramtypes", [router_1.Router, user_service_1.UserService, page_1.Page])
], LoginComponent);
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9naW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBeUU7QUFDekUsK0NBQThDO0FBQzlDLCtEQUE2RDtBQUM3RCwwQ0FBeUM7QUFDekMsZ0NBQStCO0FBQy9CLCtCQUE4QjtBQUU5QixtREFBcUQ7QUFTckQsSUFBYSxjQUFjO0lBT3pCLHdCQUFvQixNQUFjLEVBQVUsV0FBd0IsRUFBVSxJQUFVO1FBQXBFLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFVLFNBQUksR0FBSixJQUFJLENBQU07UUFMeEYsZ0JBQVcsR0FBRyxJQUFJLENBQUM7UUFNakIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFdBQUksRUFBRSxDQUFDO1FBQ3ZCLDRDQUE0QztRQUM1QyxrQ0FBa0M7SUFDcEMsQ0FBQztJQUNELGlDQUFRLEdBQVI7UUFDRSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDakMsbURBQW1EO1FBQ25ELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztJQUM5QyxDQUFDO0lBQ0QsK0JBQU0sR0FBTjtRQUNFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDdEMsTUFBTSxDQUFDO1FBQ1QsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNoQixDQUFDO0lBQ0gsQ0FBQztJQUNELDhCQUFLLEdBQUw7UUFDRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ25GLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQUMsSUFBSTtZQUFDLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1FBQzlEOzs7Ozs7VUFNRTtJQUNKLENBQUM7SUFDRCwrQkFBTSxHQUFOO1FBQ0UsS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUE7UUFDM0M7Ozs7Ozs7OztVQVNFO0lBQ0osQ0FBQztJQUNELHNDQUFhLEdBQWI7UUFDRSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNyQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMxQixJQUFJLFNBQVMsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztRQUNuRCxTQUFTLENBQUMsT0FBTyxDQUFDO1lBQ2hCLGVBQWUsRUFBRSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksYUFBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksYUFBSyxDQUFDLFNBQVMsQ0FBQztZQUM3RSxRQUFRLEVBQUUsR0FBRztTQUNkLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCwyQ0FBa0IsR0FBbEI7UUFDRSxJQUFJLGNBQWMsR0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUN6RCxJQUFJLGlCQUFpQixHQUFjLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDO1FBRS9ELElBQUksYUFBYSxHQUFHLElBQUksYUFBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ3BFLGNBQWMsQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO1FBQ3JDLGlCQUFpQixDQUFDLEtBQUssR0FBRyxhQUFhLENBQUM7UUFFeEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDcEUsd0JBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDekQsd0JBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBQ0gscUJBQUM7QUFBRCxDQUFDLEFBMUVELElBMEVDO0FBdkV5QjtJQUF2QixnQkFBUyxDQUFDLFdBQVcsQ0FBQzs4QkFBWSxpQkFBVTtpREFBQztBQUMxQjtJQUFuQixnQkFBUyxDQUFDLE9BQU8sQ0FBQzs4QkFBUSxpQkFBVTs2Q0FBQztBQUNmO0lBQXRCLGdCQUFTLENBQUMsVUFBVSxDQUFDOzhCQUFXLGlCQUFVO2dEQUFDO0FBTGpDLGNBQWM7SUFOMUIsZ0JBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFNBQVMsRUFBRSxDQUFDLDBCQUFXLENBQUM7UUFDeEIsV0FBVyxFQUFFLHdCQUF3QjtRQUNyQyxTQUFTLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSx1QkFBdUIsQ0FBQztLQUNyRSxDQUFDO3FDQVE0QixlQUFNLEVBQXVCLDBCQUFXLEVBQWdCLFdBQUk7R0FQN0UsY0FBYyxDQTBFMUI7QUExRVksd0NBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE9uSW5pdCwgRWxlbWVudFJlZiwgVmlld0NoaWxkIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3VzZXIvdXNlclwiO1xuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3VzZXIvdXNlci5zZXJ2aWNlXCI7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tIFwiQGFuZ3VsYXIvcm91dGVyXCI7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSBcInVpL3BhZ2VcIjtcbmltcG9ydCB7IENvbG9yIH0gZnJvbSBcImNvbG9yXCI7XG5pbXBvcnQgeyBWaWV3IH0gZnJvbSBcInVpL2NvcmUvdmlld1wiO1xuaW1wb3J0IHsgc2V0SGludENvbG9yIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2hpbnQtdXRpbFwiO1xuaW1wb3J0IHsgVGV4dEZpZWxkIH0gZnJvbSBcInVpL3RleHQtZmllbGRcIjtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm15LWFwcFwiLFxuICBwcm92aWRlcnM6IFtVc2VyU2VydmljZV0sXG4gIHRlbXBsYXRlVXJsOiBcInBhZ2VzL2xvZ2luL2xvZ2luLmh0bWxcIixcbiAgc3R5bGVVcmxzOiBbXCJwYWdlcy9sb2dpbi9sb2dpbi1jb21tb24uY3NzXCIsIFwicGFnZXMvbG9naW4vbG9naW4uY3NzXCJdXG59KVxuZXhwb3J0IGNsYXNzIExvZ2luQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgdXNlcjogVXNlcjtcbiAgaXNMb2dnaW5nSW4gPSB0cnVlO1xuICBAVmlld0NoaWxkKFwiY29udGFpbmVyXCIpIGNvbnRhaW5lcjogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZChcImVtYWlsXCIpIGVtYWlsOiBFbGVtZW50UmVmO1xuICBAVmlld0NoaWxkKFwicGFzc3dvcmRcIikgcGFzc3dvcmQ6IEVsZW1lbnRSZWY7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByb3V0ZXI6IFJvdXRlciwgcHJpdmF0ZSB1c2VyU2VydmljZTogVXNlclNlcnZpY2UsIHByaXZhdGUgcGFnZTogUGFnZSkge1xuICAgIHRoaXMudXNlciA9IG5ldyBVc2VyKCk7XG4gICAgLy90aGlzLnVzZXIuZW1haWwgPSBcInVzZXJAbmF0aXZlc2NyaXB0Lm9yZ1wiO1xuICAgIC8vdGhpcy51c2VyLnBhc3N3b3JkID0gXCJwYXNzd29yZFwiO1xuICB9XG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMucGFnZS5hY3Rpb25CYXJIaWRkZW4gPSB0cnVlO1xuICAgIC8vIFRPRE86IEJhY2tncm91bmQgZG9lc24ndCB3b3JrIGZvciBzb21lIHJlYXNvbi4uLlxuICAgIHRoaXMucGFnZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInJlczovL2xvZ2luYmdcIjtcbiAgfVxuICBzdWJtaXQoKSB7XG4gICAgaWYgKCF0aGlzLnVzZXIuaXNWYWxpZEVtYWlsKCkpIHtcbiAgICAgIGFsZXJ0KFwiRW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNMb2dnaW5nSW4pIHtcbiAgICAgIHRoaXMubG9naW4oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaWduVXAoKTtcbiAgICB9XG4gIH1cbiAgbG9naW4oKSB7XG4gICAgaWYgKHRoaXMudXNlci5lbWFpbCA9PT0gXCJqYWxrYW5lbkBqYWFra28uZmlcIiAmJiB0aGlzLnVzZXIucGFzc3dvcmQgPT09IFwicGFzaXBla2thXCIpIHtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFtcIi9tYXAtcGFnZVwiXSk7XG4gICAgfSBlbHNlIGFsZXJ0KFwiVW5mb3J0dW5hdGVseSB3ZSBjb3VsZCBub3QgZmluZCB5b3VyIGFjY291bnQuXCIpO1xuICAgIC8qIFRoaXMgc2VjdGlvbiBpcyBmb3IgZXZlcmxpdmUuXG4gICAgdGhpcy51c2VyU2VydmljZS5sb2dpbih0aGlzLnVzZXIpXG4gICAgICAuc3Vic2NyaWJlKFxuICAgICAgICAoKSA9PiB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbXCIvbWFwLXBhZ2VcIl0pLFxuICAgICAgICAoZXJyb3IpID0+IGFsZXJ0KFwiVW5mb3J0dW5hdGVseSB3ZSBjb3VsZCBub3QgZmluZCB5b3VyIGFjY291bnQuXCIpXG4gICAgICApO1xuICAgICovXG4gIH1cbiAgc2lnblVwKCkge1xuICAgIGFsZXJ0KFwiUmVnaXN0cmF0aW9uIGlzIG5vdCB5ZXQgYXZhaWxhYmxlLlwiKVxuICAgIC8qIFRoaXMgc2VjdGlvbiBpcyBmb3IgZXZlcmxpdmUuXG4gICAgdGhpcy51c2VyU2VydmljZS5yZWdpc3Rlcih0aGlzLnVzZXIpXG4gICAgICAuc3Vic2NyaWJlKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgYWxlcnQoXCJZb3VyIGFjY291bnQgd2FzIHN1Y2Nlc3NmdWxseSBjcmVhdGVkLlwiKTtcbiAgICAgICAgICB0aGlzLnRvZ2dsZURpc3BsYXkoKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgID0+IGFsZXJ0KFwiVW5mb3J0dW5hdGVseSB3ZSB3ZXJlIHVuYWJsZSB0byBjcmVhdGUgeW91ciBhY2NvdW50LlwiKVxuICAgICAgKTtcbiAgICAqL1xuICB9XG4gIHRvZ2dsZURpc3BsYXkoKSB7XG4gICAgdGhpcy5pc0xvZ2dpbmdJbiA9ICF0aGlzLmlzTG9nZ2luZ0luO1xuICAgIHRoaXMuc2V0VGV4dEZpZWxkQ29sb3JzKCk7XG4gICAgbGV0IGNvbnRhaW5lciA9IDxWaWV3PnRoaXMuY29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29udGFpbmVyLmFuaW1hdGUoe1xuICAgICAgYmFja2dyb3VuZENvbG9yOiB0aGlzLmlzTG9nZ2luZ0luID8gbmV3IENvbG9yKFwid2hpdGVcIikgOiBuZXcgQ29sb3IoXCIjNTk1NDU5XCIpLFxuICAgICAgZHVyYXRpb246IDIwMFxuICAgIH0pO1xuICB9XG4gIHNldFRleHRGaWVsZENvbG9ycygpIHtcbiAgICBsZXQgZW1haWxUZXh0RmllbGQgPSA8VGV4dEZpZWxkPnRoaXMuZW1haWwubmF0aXZlRWxlbWVudDtcbiAgICBsZXQgcGFzc3dvcmRUZXh0RmllbGQgPSA8VGV4dEZpZWxkPnRoaXMucGFzc3dvcmQubmF0aXZlRWxlbWVudDtcblxuICAgIGxldCBtYWluVGV4dENvbG9yID0gbmV3IENvbG9yKHRoaXMuaXNMb2dnaW5nSW4gPyBcImJsYWNrXCIgOiBcIndoaXRlXCIpO1xuICAgIGVtYWlsVGV4dEZpZWxkLmNvbG9yID0gbWFpblRleHRDb2xvcjtcbiAgICBwYXNzd29yZFRleHRGaWVsZC5jb2xvciA9IG1haW5UZXh0Q29sb3I7XG5cbiAgICBsZXQgaGludENvbG9yID0gbmV3IENvbG9yKHRoaXMuaXNMb2dnaW5nSW4gPyBcIiNBQ0E2QTdcIiA6IFwiI0M0QUZCNFwiKTtcbiAgICBzZXRIaW50Q29sb3IoeyB2aWV3OiBlbWFpbFRleHRGaWVsZCwgY29sb3I6IGhpbnRDb2xvciB9KTtcbiAgICBzZXRIaW50Q29sb3IoeyB2aWV3OiBwYXNzd29yZFRleHRGaWVsZCwgY29sb3I6IGhpbnRDb2xvciB9KTtcbiAgfVxufVxuIl19