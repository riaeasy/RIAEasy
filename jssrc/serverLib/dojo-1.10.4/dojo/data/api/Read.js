//>>built

define("dojo/data/api/Read", ["../../_base/declare"], function (declare) {
    return declare("dojo.data.api.Read", null, {getValue:function (item, attribute, defaultValue) {
        throw new Error("Unimplemented API: dojo.data.api.Read.getValue");
    }, getValues:function (item, attribute) {
        throw new Error("Unimplemented API: dojo.data.api.Read.getValues");
    }, getAttributes:function (item) {
        throw new Error("Unimplemented API: dojo.data.api.Read.getAttributes");
    }, hasAttribute:function (item, attribute) {
        throw new Error("Unimplemented API: dojo.data.api.Read.hasAttribute");
    }, containsValue:function (item, attribute, value) {
        throw new Error("Unimplemented API: dojo.data.api.Read.containsValue");
    }, isItem:function (something) {
        throw new Error("Unimplemented API: dojo.data.api.Read.isItem");
    }, isItemLoaded:function (something) {
        throw new Error("Unimplemented API: dojo.data.api.Read.isItemLoaded");
    }, loadItem:function (keywordArgs) {
        if (!this.isItemLoaded(keywordArgs.item)) {
            throw new Error("Unimplemented API: dojo.data.api.Read.loadItem");
        }
    }, fetch:function (keywordArgs) {
        throw new Error("Unimplemented API: dojo.data.api.Read.fetch");
    }, getFeatures:function () {
        return {"dojo.data.api.Read":true};
    }, close:function (request) {
        throw new Error("Unimplemented API: dojo.data.api.Read.close");
    }, getLabel:function (item) {
        throw new Error("Unimplemented API: dojo.data.api.Read.getLabel");
    }, getLabelAttributes:function (item) {
        throw new Error("Unimplemented API: dojo.data.api.Read.getLabelAttributes");
    }});
});

