/*
 * Copyright (c) 2011 Kevin Decker (http://www.incaseofstairs.com/)
 * See LICENSE for license information
 */
$(document).ready(function(){
    const ONE_PX_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=",
          IMAGE_URL = "http://static.incaseofstairs.com/themes/pixeled/images/promotejsh.gif",
          VALID_PAGE_STORE = "page-store://1",
          MOCK_NAME = "/mockFile",
          REMOTE_PROXY = "proxy:";

    var originalFile = window.File,
        originalReader = window.FileReader;

    function loadFailed(error) {
        ok(false, "Exception occured: " + error);
    }

    var userImageLifecycle = {
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
    };

    module("UserImageCache", userImageLifecycle);

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
        }, "Must throw if setImageEl has not been defined");

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

    test("load Data URI", function() {
        expect(3);

        UserImageCache.load(ONE_PX_IMAGE, loadFailed);

        equals(UserImageCache.getEntryId(), ONE_PX_IMAGE, "getEntryName");
        equals(UserImageCache.getDisplayName(), ONE_PX_IMAGE, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");
    });

    asyncTest("invalidFile", function() {
        expect(4);

        window.FileReader = function() {
            this.readAsDataURL = function(file) {
                this.error = "mockFailure";
                this.onerror();
            };
        };

        UserImageCache.load(new File(), function(error) {
            equals(error, "mockFailure", "Invalid file callback: mockFailure");

            equals(UserImageCache.getEntryId(), undefined, "getEntryName");
            equals(UserImageCache.getDisplayName(), undefined, "getDisplayName");
            equals(UserImageCache.getSrc(), undefined, "getSrc");

            start();
        });
    });

    test("load Remote URL", function() {
        expect(3);

        UserImageCache.load(IMAGE_URL, loadFailed);

        equals(UserImageCache.getEntryId(), IMAGE_URL, "getEntryName");
        equals(UserImageCache.getDisplayName(), IMAGE_URL, "getDisplayName");
        equals(UserImageCache.getSrc(), IMAGE_URL, "getSrc");
    });

    test("load Mock File", function() {
        expect(3);

        UserImageCache.load(new File(), loadFailed);

        equals(UserImageCache.getEntryId(), VALID_PAGE_STORE, "getEntryName");
        equals(UserImageCache.getDisplayName(), MOCK_NAME, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");
    });


    test("load With Proxy", function() {
        expect(9);

        UserImageCache.setRemoteProxy(REMOTE_PROXY);
        UserImageCache.load(ONE_PX_IMAGE, loadFailed);

        equals(UserImageCache.getEntryId(), ONE_PX_IMAGE, "getEntryName");
        equals(UserImageCache.getDisplayName(), ONE_PX_IMAGE, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");

        UserImageCache.load(IMAGE_URL + "&%20", loadFailed);

        equals(UserImageCache.getEntryId(), IMAGE_URL + "&%20", "getEntryName");
        equals(UserImageCache.getDisplayName(), IMAGE_URL + "&%20", "getDisplayName");
        equals(UserImageCache.getSrc(), REMOTE_PROXY + encodeURIComponent(IMAGE_URL) + "%26%2520", "getSrc");

        UserImageCache.load(new File(), loadFailed);

        equals(UserImageCache.getEntryId(), VALID_PAGE_STORE, "getEntryName");
        equals(UserImageCache.getDisplayName(), MOCK_NAME, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");
    });

    test("Reload Mock File", function() {
        expect(9);

        UserImageCache.load(new File(), loadFailed);

        equals(UserImageCache.getEntryId(), VALID_PAGE_STORE, "getEntryName");
        equals(UserImageCache.getDisplayName(), MOCK_NAME, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");

        UserImageCache.load(IMAGE_URL, loadFailed);

        equals(UserImageCache.getEntryId(), IMAGE_URL, "getEntryName");
        equals(UserImageCache.getDisplayName(), IMAGE_URL, "getDisplayName");
        equals(UserImageCache.getSrc(), IMAGE_URL, "getSrc");

        UserImageCache.load(VALID_PAGE_STORE, loadFailed);

        equals(UserImageCache.getEntryId(), VALID_PAGE_STORE, "getEntryName");
        equals(UserImageCache.getDisplayName(), MOCK_NAME, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");
    });

    asyncTest("invalidObjectLoaded", function() {
        expect(7);

        UserImageCache.load(ONE_PX_IMAGE, loadFailed);

        equals(UserImageCache.getEntryId(), ONE_PX_IMAGE, "getEntryName");
        equals(UserImageCache.getDisplayName(), ONE_PX_IMAGE, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");

        UserImageCache.load({}, function(error) {
            equals(error, UserImageCache.UNKNOWN_TYPE, "Invalid object callback: unknown_type");

            equals(UserImageCache.getEntryId(), ONE_PX_IMAGE, "getEntryName");
            equals(UserImageCache.getDisplayName(), ONE_PX_IMAGE, "getDisplayName");
            equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");

            start();
        });
    });

    var originalStorage,
        curStorage,
        mockStore = {},
        setCount = 0;

    module("UserImageCache", {
        setup: function() {
            userImageLifecycle.setup();

            try {
                if (window.sessionStorage) {
                    originalStorage = window.sessionStorage;
                    __defineGetter__("sessionStorage", function() {
                        return curStorage;
                    });

                    curStorage = {
                        getItem: function(name) {
                            return originalStorage.getItem(name);
                        },
                        setItem: function(name, value) {
                            if (name.indexOf("imageList-display") === 0 || name.indexOf("imageList-src") === 0) {
                                if (setCount > 3) {
                                    throw new Error();
                                }
                                setCount++;
                            }

                            originalStorage.setItem(name, value);
                        },
                        removeItem: function(name) {
                            if (name.indexOf("imageList-display") === 0 || name.indexOf("imageList-src") === 0) {
                                setCount--;
                            }
                            originalStorage.removeItem(name);
                        }
                    };
                }
            } catch (err) {}
        },
        teardown: function() {
            userImageLifecycle.teardown();

            if (originalStorage) {
                curStorage = originalStorage;
            }
            setCount = 0;
        }
    });

    asyncTest("cacheRemoval", function() {
        // Skip this test if we are not using sessionStorage
        if (!originalStorage) {
            return;
        }
        expect(11);

        // Load enough entries to hit our fake quota
        UserImageCache.load(new File(), loadFailed);
        var firstEntry = UserImageCache.getEntryId();
        equals(firstEntry, "page-store://1", "First Entry Id");

        UserImageCache.load(new File(), loadFailed);
        var secondEntry = UserImageCache.getEntryId();
        equals(secondEntry, "page-store://2", "Second Entry Id");

        UserImageCache.load(new File(), loadFailed);
        var thirdEntry = UserImageCache.getEntryId();
        equals(thirdEntry, "page-store://3", "Third Entry Id");

        // Verify that the last two are still in the cache
        UserImageCache.load("page-store://2", loadFailed);
        equals(UserImageCache.getEntryId(), "page-store://2", "getEntryId");
        equals(UserImageCache.getDisplayName(), MOCK_NAME, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");

        UserImageCache.load("page-store://3", loadFailed);
        equals(UserImageCache.getEntryId(), "page-store://3", "getEntryId");
        equals(UserImageCache.getDisplayName(), MOCK_NAME, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");

        // Now attempt to reload the first one. This should have been pushed out of the cache
        UserImageCache.load("page-store://1", function(error) {
            equals(error, UserImageCache.NOT_FOUND, "Invalid cache callback: not_found");

            equals(UserImageCache.getEntryId(), "page-store://3", "getEntryId");

            start();
        });
    });

    asyncTest("cacheRemovalOrder", function() {
        // Skip this test if we are not using sessionStorage
        if (!originalStorage) {
            return;
        }
        expect(12);

        // Load enough entries to hit our fake quota
        UserImageCache.load(new File(), loadFailed);
        var firstEntry = UserImageCache.getEntryId();
        equals(firstEntry, "page-store://1", "First Entry Id");

        UserImageCache.load(new File(), loadFailed);
        var secondEntry = UserImageCache.getEntryId();
        equals(secondEntry, "page-store://2", "Second Entry Id");

        // Reload the first element to push 2 to the last used state
        UserImageCache.load("page-store://1", loadFailed);
        equals(UserImageCache.getEntryId(), "page-store://1", "getEntryId");

        UserImageCache.load(new File(), loadFailed);
        var thirdEntry = UserImageCache.getEntryId();
        equals(thirdEntry, "page-store://3", "Third Entry Id");

        // Verify that the last two are still in the cache
        UserImageCache.load("page-store://1", loadFailed);
        equals(UserImageCache.getEntryId(), "page-store://1", "getEntryId");
        equals(UserImageCache.getDisplayName(), MOCK_NAME, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");

        UserImageCache.load("page-store://3", loadFailed);
        equals(UserImageCache.getEntryId(), "page-store://3", "getEntryId");
        equals(UserImageCache.getDisplayName(), MOCK_NAME, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");

        // Now attempt to reload the first one. This should have been pushed out of the cache
        UserImageCache.load("page-store://2", function(error) {
            equals(error, UserImageCache.NOT_FOUND, "Invalid cache callback: not_found");

            equals(UserImageCache.getEntryId(), "page-store://3", "getEntryId");

            start();
        });
    });

    asyncTest("largerThanStorage", function() {
        // Skip this test if we are not using sessionStorage
        if (!originalStorage) {
            return;
        }
        expect(11);

        setCount = 4;

        // Load enough entries to hit our fake quota
        UserImageCache.load(new File(), loadFailed);
        var firstEntry = UserImageCache.getEntryId();
        equals(firstEntry, "page-store://1", "First Entry Id");
        equals(UserImageCache.getDisplayName(), MOCK_NAME, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");

        UserImageCache.load(new File(), loadFailed);
        var secondEntry = UserImageCache.getEntryId();
        equals(secondEntry, "page-store://2", "Second Entry Id");
        equals(UserImageCache.getDisplayName(), MOCK_NAME, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");

        // Reload the first element to push 2 to the last used state
        UserImageCache.load("page-store://2", loadFailed);
        equals(UserImageCache.getEntryId(), "page-store://2", "getEntryId");
        equals(UserImageCache.getDisplayName(), MOCK_NAME, "getDisplayName");
        equals(UserImageCache.getSrc(), ONE_PX_IMAGE, "getSrc");

        // Now attempt to reload the first one. This should have been pushed out of the cache
        UserImageCache.load("page-store://1", function(error) {
            equals(error, UserImageCache.NOT_FOUND, "Invalid cache callback: not_found");

            equals(UserImageCache.getEntryId(), "page-store://2", "getEntryId");

            start();
        });
    });
});
