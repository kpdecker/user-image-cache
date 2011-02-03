/*
 * Copyright (c) 2011 Kevin Decker (http://www.incaseofstairs.com/)
 * See LICENSE for license information
 */
$(document).ready(function(){
    const ONE_PX_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=",
          IMAGE_URL = "http://static.incaseofstairs.com/themes/pixeled/images/promotejsh.gif",
          MOCK_NAME = "/mockFile";

    var originalFile = window.File,
        originalReader = window.FileReader;

    module("UserImageCache", {
        setup: function() {
            UserImageCache.setImageEl(document.getElementById("load-image"));
            window.File = function() {
                this.name = MOCK_NAME;
                this.toString = function() {
                    return "Mock File";
                };
            };
            window.FileReader = function() {
                this.readAsDataURL = function(file) {
                    this.result = ONE_PX_IMAGE;
                    this.onload();
                };
            };
        },
        teardown: function() {
            UserImageCache.reset();
            window.File = originalFile;
            window.FileReader = originalReader;
        }
    });

    test("isLocalSupported", function() {
        expect(1);
        equals(UserImageCache.isLocalSupported(), true, "isLocalSupported");
    });

    test("initState", function() {
        expect(5);
        UserImageCache.reset();
        equals(UserImageCache.getEntryId(), undefined, "getEntryName");
        equals(UserImageCache.getDisplayName(), undefined, "getDisplayName");
        equals(UserImageCache.getSrc(), undefined, "getSrc");

        raises(function() {
            UserImageCache.load(ONE_PX_IMAGE);
        }, "Must throw if setImageEl has not been defined")

        UserImageCache.setImageEl(document.getElementById("load-image"));
        ok(true, "setImageEl Success");
    });

    asyncTest("cacheFail", function() {
        expect(4);

        UserImageCache.load("page-store://invalid", function(error) {
            equals(error, UserImageCache.NOT_FOUND, "Invalid cache callback: not_found");

            equals(UserImageCache.getEntryId(), undefined, "getEntryName");
            equals(UserImageCache.getDisplayName(), undefined, "getDisplayName");
            equals(UserImageCache.getSrc(), undefined, "getSrc");

            start();
        });
    });

    asyncTest("invalidObject", function() {
        expect(4);

        UserImageCache.load({}, function(error) {
            equals(error, UserImageCache.UNKNOWN_TYPE, "Invalid object callback: unknown_type");

            equals(UserImageCache.getEntryId(), undefined, "getEntryName");
            equals(UserImageCache.getDisplayName(), undefined, "getDisplayName");
            equals(UserImageCache.getSrc(), undefined, "getSrc");

            start();
        });
    });
});
