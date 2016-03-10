//>>built

define("dojox/mobile/dh/DataHandler", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/Deferred", "./ContentTypeMap"], function (declare, lang, Deferred, ContentTypeMap) {
    return declare("dojox.mobile.dh.DataHandler", null, {ds:null, target:null, refNode:null, constructor:function (ds, target, refNode) {
        this.ds = ds;
        this.target = target;
        this.refNode = refNode;
    }, processData:function (contentType, callback) {
        var ch = ContentTypeMap.getHandlerClass(contentType);
        require([ch], lang.hitch(this, function (ContentHandler) {
            Deferred.when(this.ds.getData(), lang.hitch(this, function () {
                Deferred.when(new ContentHandler().parse(this.ds.text, this.target, this.refNode), function (id) {
                    callback(id);
                });
            }));
        }));
    }});
});

