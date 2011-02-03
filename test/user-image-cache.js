/*
 * Copyright (c) 2011 Kevin Decker (http://www.incaseofstairs.com/)
 * See LICENSE for license information
 */
$(document).ready(function(){
    const ONE_PX_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=",
          IMAGE_URL = "http://static.incaseofstairs.com/themes/pixeled/images/promotejsh.gif",
          MOCK_NAME = "/mockFile";

    module("UserImageCache", {
        setup: function() {
            UserImageCache.setImageEl(document.getElementById("load-image"));
        },
        teardown: function() {
            UserImageCache.reset();
        }
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
});
