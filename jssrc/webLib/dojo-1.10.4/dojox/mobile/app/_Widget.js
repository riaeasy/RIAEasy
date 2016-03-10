//>>built

define("dojox/mobile/app/_Widget", ["dijit", "dojo", "dojox", "dojo/require!dijit/_WidgetBase"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.mobile.app._Widget");
    dojo.experimental("dojox.mobile.app._Widget");
    dojo.require("dijit._WidgetBase");
    dojo.declare("dojox.mobile.app._Widget", dijit._WidgetBase, {getScroll:function () {
        return {x:dojo.global.scrollX, y:dojo.global.scrollY};
    }, connect:function (target, event, fn) {
        if (event.toLowerCase() == "dblclick" || event.toLowerCase() == "ondblclick") {
            if (dojo.global["Mojo"]) {
                return this.connect(target, Mojo.Event.tap, fn);
            }
        }
        return this.inherited(arguments);
    }});
});

