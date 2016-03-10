//>>built

define("dojox/mobile/dh/ContentTypeMap", ["dojo/_base/lang"], function (lang) {
    var o = {};
    lang.setObject("dojox.mobile.dh.ContentTypeMap", o);
    o.map = {"html":"dojox/mobile/dh/HtmlContentHandler", "json":"dojox/mobile/dh/JsonContentHandler"};
    o.add = function (contentType, handlerClass) {
        this.map[contentType] = handlerClass;
    };
    o.getHandlerClass = function (contentType) {
        return this.map[contentType];
    };
    return o;
});

