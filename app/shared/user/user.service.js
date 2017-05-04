"use strict";
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var Rx_1 = require("rxjs/Rx");
require("rxjs/add/operator/do");
require("rxjs/add/operator/map");
var UserService = (function () {
    function UserService(http) {
        this.http = http;
    }
    UserService.prototype.register = function (user) {
        /* This section is for everlive.
        let headers = new Headers();
        headers.append("Content-type", "application/json");
    
        return this.http.post(
          Config.apiUrl + "Users",
          JSON.stringify({
            Username: user.email,
            Email: user.email,
            Password: user.password
          }),
          { headers: headers }
        )
        .catch(this.handleErrors);
        */
    };
    UserService.prototype.login = function (user) {
        /* This section is for everlive.
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
    
        return this.http.post(
          Config.apiUrl + "oauth/token",
          JSON.stringify({
            username: user.email,
            password: user.password,
            grant_type: "password"
          }),
          { headers: headers }
        )
        .map(response => response.json())
        .do(data => {
          Config.token = data.Result.access_token;
        })
        .catch(this.handleErrors);
        */
    };
    UserService.prototype.handleErrors = function (error) {
        console.log(JSON.stringify(error.json()));
        return Rx_1.Observable.throw(error);
    };
    return UserService;
}());
UserService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXNlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBMkM7QUFDM0Msc0NBQXdEO0FBQ3hELDhCQUFxQztBQUNyQyxnQ0FBOEI7QUFDOUIsaUNBQStCO0FBTS9CLElBQWEsV0FBVztJQUN0QixxQkFBb0IsSUFBVTtRQUFWLFNBQUksR0FBSixJQUFJLENBQU07SUFBRyxDQUFDO0lBRWxDLDhCQUFRLEdBQVIsVUFBUyxJQUFVO1FBQ2pCOzs7Ozs7Ozs7Ozs7OztVQWNFO0lBQ0osQ0FBQztJQUVELDJCQUFLLEdBQUwsVUFBTSxJQUFVO1FBQ2Q7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQWtCRTtJQUNKLENBQUM7SUFFRCxrQ0FBWSxHQUFaLFVBQWEsS0FBZTtRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQyxNQUFNLENBQUMsZUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBQ0gsa0JBQUM7QUFBRCxDQUFDLEFBL0NELElBK0NDO0FBL0NZLFdBQVc7SUFEdkIsaUJBQVUsRUFBRTtxQ0FFZSxXQUFJO0dBRG5CLFdBQVcsQ0ErQ3ZCO0FBL0NZLGtDQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IEh0dHAsIEhlYWRlcnMsIFJlc3BvbnNlIH0gZnJvbSBcIkBhbmd1bGFyL2h0dHBcIjtcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzL1J4XCI7XHJcbmltcG9ydCBcInJ4anMvYWRkL29wZXJhdG9yL2RvXCI7XHJcbmltcG9ydCBcInJ4anMvYWRkL29wZXJhdG9yL21hcFwiO1xyXG5cclxuaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuL3VzZXJcIjtcclxuaW1wb3J0IHsgQ29uZmlnIH0gZnJvbSBcIi4uL2NvbmZpZ1wiO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgVXNlclNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cCkge31cclxuXHJcbiAgcmVnaXN0ZXIodXNlcjogVXNlcikge1xyXG4gICAgLyogVGhpcyBzZWN0aW9uIGlzIGZvciBldmVybGl2ZS5cclxuICAgIGxldCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcclxuICAgIGhlYWRlcnMuYXBwZW5kKFwiQ29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QoXHJcbiAgICAgIENvbmZpZy5hcGlVcmwgKyBcIlVzZXJzXCIsXHJcbiAgICAgIEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBVc2VybmFtZTogdXNlci5lbWFpbCxcclxuICAgICAgICBFbWFpbDogdXNlci5lbWFpbCxcclxuICAgICAgICBQYXNzd29yZDogdXNlci5wYXNzd29yZFxyXG4gICAgICB9KSxcclxuICAgICAgeyBoZWFkZXJzOiBoZWFkZXJzIH1cclxuICAgIClcclxuICAgIC5jYXRjaCh0aGlzLmhhbmRsZUVycm9ycyk7XHJcbiAgICAqL1xyXG4gIH1cclxuXHJcbiAgbG9naW4odXNlcjogVXNlcikge1xyXG4gICAgLyogVGhpcyBzZWN0aW9uIGlzIGZvciBldmVybGl2ZS5cclxuICAgIGxldCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcclxuICAgIGhlYWRlcnMuYXBwZW5kKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5odHRwLnBvc3QoXHJcbiAgICAgIENvbmZpZy5hcGlVcmwgKyBcIm9hdXRoL3Rva2VuXCIsXHJcbiAgICAgIEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICB1c2VybmFtZTogdXNlci5lbWFpbCxcclxuICAgICAgICBwYXNzd29yZDogdXNlci5wYXNzd29yZCxcclxuICAgICAgICBncmFudF90eXBlOiBcInBhc3N3b3JkXCJcclxuICAgICAgfSksXHJcbiAgICAgIHsgaGVhZGVyczogaGVhZGVycyB9XHJcbiAgICApXHJcbiAgICAubWFwKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcclxuICAgIC5kbyhkYXRhID0+IHtcclxuICAgICAgQ29uZmlnLnRva2VuID0gZGF0YS5SZXN1bHQuYWNjZXNzX3Rva2VuO1xyXG4gICAgfSlcclxuICAgIC5jYXRjaCh0aGlzLmhhbmRsZUVycm9ycyk7XHJcbiAgICAqL1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlRXJyb3JzKGVycm9yOiBSZXNwb25zZSkge1xyXG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZXJyb3IuanNvbigpKSk7XHJcbiAgICByZXR1cm4gT2JzZXJ2YWJsZS50aHJvdyhlcnJvcik7XHJcbiAgfVxyXG59XHJcbiJdfQ==