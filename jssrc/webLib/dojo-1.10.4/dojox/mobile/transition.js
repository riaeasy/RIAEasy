//>>built

define("dojox/mobile/transition", ["dojo/_base/Deferred", "dojo/_base/config"], function (Deferred, config) {
    if (config.mblCSS3Transition) {
        var transitDeferred = new Deferred();
        require([config.mblCSS3Transition], function (transit) {
            transitDeferred.resolve(transit);
        });
        return transitDeferred;
    }
    return null;
});

