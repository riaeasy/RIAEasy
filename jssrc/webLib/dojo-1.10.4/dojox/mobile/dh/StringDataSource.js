//>>built

define("dojox/mobile/dh/StringDataSource", ["dojo/_base/declare"], function (declare) {
    return declare("dojox.mobile.dh.StringDataSource", null, {text:"", constructor:function (text) {
        this.text = text;
    }, getData:function () {
        return this.text;
    }});
});

