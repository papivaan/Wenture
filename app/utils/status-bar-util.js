"use strict";
var application = require("application");
var platform = require("platform");
var utils = require("utils/utils");
function setStatusBarColors() {
    // Make the iOS status bar transparent with white text.
    // See https://github.com/burkeholland/nativescript-statusbar/issues/2
    // for details on the technique used.
    if (application.ios) {
        var AppDelegate = UIResponder.extend({
            applicationDidFinishLaunchingWithOptions: function () {
                utils.ios.getter(UIApplication, UIApplication.sharedApplication).statusBarStyle = UIStatusBarStyle.LightContent;
                return true;
            }
        }, {
            name: "AppDelegate",
            protocols: [UIApplicationDelegate]
        });
        application.ios.delegate = AppDelegate;
    }
    // Make the Android status bar transparent.
    // See http://bradmartin.net/2016/03/10/fullscreen-and-navigation-bar-color-in-a-nativescript-android-app/
    // for details on the technique used.
    if (application.android) {
        application.android.onActivityStarted = function () {
            if (application.android && platform.device.sdkVersion >= "21") {
                var View = android.view.View;
                var window_1 = application.android.startActivity.getWindow();
                window_1.setStatusBarColor(0x000000);
                var decorView = window_1.getDecorView();
                decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
            }
        };
    }
}
exports.setStatusBarColors = setStatusBarColors;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzLWJhci11dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3RhdHVzLWJhci11dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx5Q0FBMkM7QUFDM0MsbUNBQXFDO0FBQ3JDLG1DQUFxQztBQVFyQztJQUNFLHVEQUF1RDtJQUN2RCxzRUFBc0U7SUFDdEUscUNBQXFDO0lBQ3JDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUksV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7WUFDbkMsd0NBQXdDLEVBQUU7Z0JBQ3hDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsWUFBWSxDQUFDO2dCQUNoSCxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2QsQ0FBQztTQUNGLEVBQUU7WUFDQyxJQUFJLEVBQUUsYUFBYTtZQUNuQixTQUFTLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztTQUNuQyxDQUFDLENBQUM7UUFDTCxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUM7SUFDekMsQ0FBQztJQUVELDJDQUEyQztJQUMzQywwR0FBMEc7SUFDMUcscUNBQXFDO0lBQ3JDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLFdBQVcsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEdBQUc7WUFDdEMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDN0IsSUFBSSxRQUFNLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzNELFFBQU0sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFbkMsSUFBSSxTQUFTLEdBQUcsUUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN0QyxTQUFTLENBQUMscUJBQXFCLENBQzdCLElBQUksQ0FBQyw0QkFBNEI7c0JBQy9CLElBQUksQ0FBQyxxQ0FBcUM7c0JBQzFDLElBQUksQ0FBQyxnQ0FBZ0M7c0JBQ3JDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1lBQzVDLENBQUM7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQztBQXBDRCxnREFvQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tIFwiYXBwbGljYXRpb25cIjtcclxuaW1wb3J0ICogYXMgcGxhdGZvcm0gZnJvbSBcInBsYXRmb3JtXCI7XHJcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gXCJ1dGlscy91dGlsc1wiO1xyXG5cclxuZGVjbGFyZSB2YXIgYW5kcm9pZDogYW55O1xyXG5kZWNsYXJlIHZhciBVSVJlc3BvbmRlcjogYW55O1xyXG5kZWNsYXJlIHZhciBVSVN0YXR1c0JhclN0eWxlOiBhbnk7XHJcbmRlY2xhcmUgdmFyIFVJQXBwbGljYXRpb246IGFueTtcclxuZGVjbGFyZSB2YXIgVUlBcHBsaWNhdGlvbkRlbGVnYXRlOiBhbnk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0U3RhdHVzQmFyQ29sb3JzKCkge1xyXG4gIC8vIE1ha2UgdGhlIGlPUyBzdGF0dXMgYmFyIHRyYW5zcGFyZW50IHdpdGggd2hpdGUgdGV4dC5cclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2J1cmtlaG9sbGFuZC9uYXRpdmVzY3JpcHQtc3RhdHVzYmFyL2lzc3Vlcy8yXHJcbiAgLy8gZm9yIGRldGFpbHMgb24gdGhlIHRlY2huaXF1ZSB1c2VkLlxyXG4gIGlmIChhcHBsaWNhdGlvbi5pb3MpIHtcclxuICAgIGxldCBBcHBEZWxlZ2F0ZSA9IFVJUmVzcG9uZGVyLmV4dGVuZCh7XHJcbiAgICAgIGFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nV2l0aE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHV0aWxzLmlvcy5nZXR0ZXIoVUlBcHBsaWNhdGlvbiwgVUlBcHBsaWNhdGlvbi5zaGFyZWRBcHBsaWNhdGlvbikuc3RhdHVzQmFyU3R5bGUgPSBVSVN0YXR1c0JhclN0eWxlLkxpZ2h0Q29udGVudDtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICAgIG5hbWU6IFwiQXBwRGVsZWdhdGVcIixcclxuICAgICAgICBwcm90b2NvbHM6IFtVSUFwcGxpY2F0aW9uRGVsZWdhdGVdXHJcbiAgICAgIH0pO1xyXG4gICAgYXBwbGljYXRpb24uaW9zLmRlbGVnYXRlID0gQXBwRGVsZWdhdGU7XHJcbiAgfVxyXG5cclxuICAvLyBNYWtlIHRoZSBBbmRyb2lkIHN0YXR1cyBiYXIgdHJhbnNwYXJlbnQuXHJcbiAgLy8gU2VlIGh0dHA6Ly9icmFkbWFydGluLm5ldC8yMDE2LzAzLzEwL2Z1bGxzY3JlZW4tYW5kLW5hdmlnYXRpb24tYmFyLWNvbG9yLWluLWEtbmF0aXZlc2NyaXB0LWFuZHJvaWQtYXBwL1xyXG4gIC8vIGZvciBkZXRhaWxzIG9uIHRoZSB0ZWNobmlxdWUgdXNlZC5cclxuICBpZiAoYXBwbGljYXRpb24uYW5kcm9pZCkge1xyXG4gICAgYXBwbGljYXRpb24uYW5kcm9pZC5vbkFjdGl2aXR5U3RhcnRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoYXBwbGljYXRpb24uYW5kcm9pZCAmJiBwbGF0Zm9ybS5kZXZpY2Uuc2RrVmVyc2lvbiA+PSBcIjIxXCIpIHtcclxuICAgICAgICBsZXQgVmlldyA9IGFuZHJvaWQudmlldy5WaWV3O1xyXG4gICAgICAgIGxldCB3aW5kb3cgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLnN0YXJ0QWN0aXZpdHkuZ2V0V2luZG93KCk7XHJcbiAgICAgICAgd2luZG93LnNldFN0YXR1c0JhckNvbG9yKDB4MDAwMDAwKTtcclxuXHJcbiAgICAgICAgbGV0IGRlY29yVmlldyA9IHdpbmRvdy5nZXREZWNvclZpZXcoKTtcclxuICAgICAgICBkZWNvclZpZXcuc2V0U3lzdGVtVWlWaXNpYmlsaXR5KFxyXG4gICAgICAgICAgVmlldy5TWVNURU1fVUlfRkxBR19MQVlPVVRfU1RBQkxFXHJcbiAgICAgICAgICB8IFZpZXcuU1lTVEVNX1VJX0ZMQUdfTEFZT1VUX0hJREVfTkFWSUdBVElPTlxyXG4gICAgICAgICAgfCBWaWV3LlNZU1RFTV9VSV9GTEFHX0xBWU9VVF9GVUxMU0NSRUVOXHJcbiAgICAgICAgICB8IFZpZXcuU1lTVEVNX1VJX0ZMQUdfSU1NRVJTSVZFX1NUSUNLWSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG59XHJcbiJdfQ==