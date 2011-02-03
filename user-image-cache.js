/*
 * Copyright (c) 2010-2011 Kevin Decker (http://www.incaseofstairs.com/)
 * See LICENSE for license information
 */
// Specs in use:
// http://www.w3.org/TR/FileAPI/
// http://www.w3.org/TR/webstorage/
var UserImageCache;
(function() {
    var curEntry,
        image;

    // Check for browser support of session storage and that it is accessible
    // This may be inaccessible under certain contexts such as file://
    function supportsSessionStorage() {
        try {
            return !!window.sessionStorage;
        } catch (err) {
            return false;
        }
    }
    var localDataBinding = (function() {
        if (supportsSessionStorage()) {
            // If they support FileReader they really should support storage... but who knows (With the exception of file://)
            return {
                reset: function() {
                    var len = (parseInt(sessionStorage["imageList-count"], 10)||0);
                    while (len--) {
                        sessionStorage.removeItem("imageList-src-" + len);
                        sessionStorage.removeItem("imageList-display-" + len);
                    }
                    sessionStorage.removeItem("imageList-count");
                },
                storeImage: function(name, data) {
                    var entryId = (parseInt(sessionStorage["imageList-count"], 10)||0)+1;
                    sessionStorage["imageList-count"] = entryId;
                    sessionStorage["imageList-src-" + entryId] = data;
                    sessionStorage["imageList-display-" + entryId] = name;
                    return entryId;
                },
                getImage: function(entryId) {
                    return { src: sessionStorage["imageList-src-" + entryId], displayName: sessionStorage["imageList-display-" + entryId] };
                }
            };
        } else {
            // Fail over to plain js structures, meaing that refresh, etc will cause failures.
            var cache = [];
            return {
                reset: function() {
                    cache = [];
                },
                storeImage: function(name, data) {
                    cache.push({ src: data, displayName: name });
                    return cache.length-1;
                },
                getImage: function(entryId) {
                    return cache[entryId];
                }
            };
        }
    })();

    UserImageCache = {
        NOT_FOUND: "not_found",
        UNKNOWN_TYPE: "unknown_type",

        /**
         * Determines if local file reads are possible in the current execution environment.
         */
        isLocalSupported: function() {
            try {
                return !!window.FileReader;
            } catch (err) {
                return false;
            }
        },

        /**
         * Retrieves the entry id for the current entry, if one is defined.
         * This value may be passed to the load method to reload the image
         * if it is still cached.
         */
        getEntryId: function() { return curEntry && curEntry.entryId; },

        /**
         * Retrieves the display name for the current entry, if one is defined.
         */
        getDisplayName: function() { return curEntry && curEntry.displayName; },

        /**
         * Retrieves the src URI for the current entry, if one is defined.
         */
        getSrc: function() { return curEntry && curEntry.src },

        /**
         * Sets the element that images will be loaded into.
         */
        setImageEl: function(el) {
            image = el;
        },

        /**
         * Loads a given image.
         *
         * @param file may be one of:
         *  - File object (if supported)
         *  - Image URI
         *  - Entry ID returned by getEntryId for a previous image
         *
         * @param onError(error) optional callback that is executed if the image can not be loaded
         *      Errors include:
         *          - UserImageCache.NOT_FOUND : Unable to lookup cached image element.
         *          - UserImageCache.UNKNOWN_TYPE : File is unknown type
         *          - Result of FileReader.error
         */
        load: function(file, onError) {
            if (!image) {
                throw new Error("Must call setImageEl prior to attempting to load an image");
            }

            // the file from the session store if that is the case
            if (typeof file === "string") {
                var match = /^page-store:\/\/(.*)$/.exec(file);
                if (this.isLocalSupported() && match) {
                    curEntry = localDataBinding.getImage(match[1]);
                    if (!curEntry) {
                        // We could not find the cache data. This could be due to a refresh in the local case,
                        // or due to someone attempting to paste a URL that uses a local reference.
                        onError && onError(UserImageCache.NOT_FOUND);
                        return;
                    }
                    curEntry.entryId = "page-store://" + match[1];
                } else {
                    curEntry = { entryId: file, src: file, displayName: file };
                }
                image.src = UserImageCache.getSrc();
            } else if (this.isLocalSupported() && file instanceof File) {
                var reader = new FileReader();
                reader.onload = function(event) {
                    var entryId = localDataBinding.storeImage(file.name || file.fileName, reader.result);  // std || impl to be safe
                    curEntry = localDataBinding.getImage(entryId);
                    curEntry.entryId = "page-store://" + entryId;
                    image.src = UserImageCache.getSrc();
                };
                reader.onerror = function(event) {
                    onError && onError(reader.error);
                };
                reader.readAsDataURL(file);
            } else {
                onError && onError(UserImageCache.UNKNOWN_TYPE);
            }
        },

        reset: function() {
            localDataBinding.reset();
            image = undefined;
            curEntry = undefined;
        }
    };
})();
