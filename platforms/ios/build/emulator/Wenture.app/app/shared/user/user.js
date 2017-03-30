"use strict";
var validator = require("email-validator");
var User = (function () {
    function User() {
    }
    User.prototype.isValidEmail = function () {
        return validator.validate(this.email);
    };
    return User;
}());
exports.User = User;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRTNDO0lBQUE7SUFNQSxDQUFDO0lBSEMsMkJBQVksR0FBWjtRQUNFLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBQ0gsV0FBQztBQUFELENBQUMsQUFORCxJQU1DO0FBTlksb0JBQUkiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgdmFsaWRhdG9yID0gcmVxdWlyZShcImVtYWlsLXZhbGlkYXRvclwiKTtcblxuZXhwb3J0IGNsYXNzIFVzZXIge1xuICBlbWFpbDogc3RyaW5nO1xuICBwYXNzd29yZDogc3RyaW5nO1xuICBpc1ZhbGlkRW1haWwoKSB7XG4gICAgcmV0dXJuIHZhbGlkYXRvci52YWxpZGF0ZSh0aGlzLmVtYWlsKTtcbiAgfVxufVxuIl19