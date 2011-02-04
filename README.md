# user-image-cache
Javascript library which caches the collection of images input by the user. These images may be URLs or files loaded via the File API, where supported. As necessary this library will cache files in local storage for access at a later time.

## API
- UserImageCache
    - setImageEl(el)
        Sets the element that images will be loaded into. This must be called prior to any other UserImageCache APIs
    - load(file, onError)
        Loads a given image.

        file may be one of:
            - File object (if supported)
            - Image URI
            - Entry ID returned by getEntryId for a previous image

        onError(error) optional callback that is executed if the image can not be loaded
        Errors include:
            - UserImageCache.NOT_FOUND : Unable to lookup cached image element.
            - UserImageCache.UNKNOWN_TYPE : File is unknown type
            - Result of FileReader.error

    - getEntryId
        Retrieves the entry id for the current entry, if one is defined.
        This value may be passed to the load method to reload the image
        if it is still cached.
    - getDisplayName
        Retrieves the display name for the current entry, if one is defined.
    - getSrc
        Retrieves the src URI for the current entry, if one is defined.

    - isLocalSupported
        Determines if local file reads are possible in the current execution environment.

## Example
See example.html for example usage. Note that file reader access might error in some environments if used from the file:// protocol.
