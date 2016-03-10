//>>built

define("dojox/mobile/app/SceneAssistant", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.mobile.app.SceneAssistant");
    dojo.experimental("dojox.mobile.app.SceneAssistant");
    dojo.declare("dojox.mobile.app.SceneAssistant", null, {constructor:function () {
    }, setup:function () {
    }, activate:function (params) {
    }, deactivate:function () {
    }, destroy:function () {
        var children = dojo.query("> [widgetId]", this.containerNode).map(dijit.byNode);
        dojo.forEach(children, function (child) {
            child.destroyRecursive();
        });
        this.disconnect();
    }, connect:function (obj, method, callback) {
        if (!this._connects) {
            this._connects = [];
        }
        this._connects.push(dojo.connect(obj, method, callback));
    }, disconnect:function () {
        dojo.forEach(this._connects, dojo.disconnect);
        this._connects = [];
    }});
});

