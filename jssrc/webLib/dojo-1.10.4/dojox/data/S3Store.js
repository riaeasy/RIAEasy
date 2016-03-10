//>>built

define("dojox/data/S3Store", ["dojo/_base/declare", "dojox/data/JsonRestStore", "dojox/rpc/ProxiedPath"], function (declare, JsonRestStore, ProxiedPath) {
    return declare("dojox.data.S3Store", JsonRestStore, {_processResults:function (results) {
        var keyElements = results.getElementsByTagName("Key");
        var jsResults = [];
        var self = this;
        for (var i = 0; i < keyElements.length; i++) {
            var keyElement = keyElements[i];
            var val = {_loadObject:(function (key, val) {
                return function (callback) {
                    delete this._loadObject;
                    self.service(key).addCallback(callback);
                };
            })(keyElement.firstChild.nodeValue, val)};
            jsResults.push(val);
        }
        return {totalCount:jsResults.length, items:jsResults};
    }});
});

